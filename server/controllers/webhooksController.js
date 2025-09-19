const { pool } = require('../config/database');

// Obter todos os webhooks
const getWebhooks = async (req, res) => {
  try {
    const [webhooks] = await pool.execute(
      'SELECT * FROM webhooks ORDER BY type ASC'
    );

    res.json(webhooks);
  } catch (error) {
    console.error('Erro ao buscar webhooks:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar ou atualizar webhook
const saveWebhook = async (req, res) => {
  try {
    const { type, url } = req.body;

    if (!type || !url) {
      return res.status(400).json({ error: 'Tipo e URL são obrigatórios' });
    }

    if (!['save', 'update'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser "save" ou "update"' });
    }

    // Verificar se já existe webhook deste tipo
    const [existing] = await pool.execute(
      'SELECT id FROM webhooks WHERE type = ?',
      [type]
    );

    if (existing.length > 0) {
      // Atualizar webhook existente
      await pool.execute(
        'UPDATE webhooks SET url = ? WHERE type = ?',
        [url, type]
      );
      
      const [updated] = await pool.execute(
        'SELECT * FROM webhooks WHERE type = ?',
        [type]
      );
      
      res.json(updated[0]);
    } else {
      // Criar novo webhook
      const [result] = await pool.execute(
        'INSERT INTO webhooks (type, url) VALUES (?, ?)',
        [type, url]
      );

      const [newWebhook] = await pool.execute(
        'SELECT * FROM webhooks WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(newWebhook[0]);
    }
  } catch (error) {
    console.error('Erro ao salvar webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Excluir webhook
const deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM webhooks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Webhook não encontrado' });
    }

    res.json({ message: 'Webhook excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  getWebhooks,
  saveWebhook,
  deleteWebhook
};
