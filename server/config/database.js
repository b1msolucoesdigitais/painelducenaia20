const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '185.225.22.119',
  user: process.env.DB_USER || 'bmdigita_iaducena',
  password: process.env.DB_PASSWORD || '@B41gke84',
  database: process.env.DB_NAME || 'bmdigita_iaducena',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

const pool = mysql.createPool(dbConfig);

// Função para testar a conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    return false;
  }
}

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // Criar tabela de usuários
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de seções
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        \`order\` INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de webhooks
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('save', 'update') NOT NULL,
        url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Inserir usuário padrão se não existir
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('ducena@123', 10);
      await connection.execute(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['admin@ducena.com', hashedPassword]
      );
      console.log('👤 Usuário padrão criado: admin@ducena.com / ducena@123');
    }

    // Inserir seções padrão se não existirem
    const [sections] = await connection.execute('SELECT COUNT(*) as count FROM sections');
    if (sections[0].count === 0) {
      const defaultSections = [
        { title: 'Introdução', content: 'Você é um assistente de IA especializado em...', order: 1 },
        { title: 'Instruções Gerais', content: 'Sempre seja útil, preciso e educado...', order: 2 },
        { title: 'Formato de Resposta', content: 'Responda sempre em formato estruturado...', order: 3 }
      ];

      for (const section of defaultSections) {
        await connection.execute(
          'INSERT INTO sections (title, content, `order`) VALUES (?, ?, ?)',
          [section.title, section.content, section.order]
        );
      }
      console.log('📝 Seções padrão criadas');
    }

    connection.release();
    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
