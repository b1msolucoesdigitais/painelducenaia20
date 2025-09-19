const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Atualizar perfil do usuário atual
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email, currentPassword, newPassword } = req.body;

    // Buscar usuário atual
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = users[0];

    // Verificar senha atual se fornecida
    if (currentPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }
    }

    // Preparar dados para atualização
    const updates = [];
    const values = [];

    if (email && email !== user.email) {
      // Verificar se email já existe
      const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
      updates.push('email = ?');
      values.push(email);
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhuma alteração fornecida' });
    }

    // Atualizar usuário
    values.push(userId);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);

    // Buscar usuário atualizado
    const [updatedUsers] = await pool.execute('SELECT id, email, created_at FROM users WHERE id = ?', [userId]);
    const updatedUser = updatedUsers[0];

    res.json({ 
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo usuário
const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );

    // Buscar usuário criado
    const [newUsers] = await pool.execute('SELECT id, email, created_at FROM users WHERE id = ?', [result.insertId]);
    const newUser = newUsers[0];

    res.status(201).json({ 
      message: 'Usuário criado com sucesso',
      user: newUser
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar usuários (apenas para admin)
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, email, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  updateProfile,
  createUser,
  getUsers
};
