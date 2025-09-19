const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, initializeDatabase } = require('./config/database');
const { authenticateToken } = require('./middleware/auth');

// Importar controllers
const authController = require('./controllers/authController');
const sectionsController = require('./controllers/sectionsController');
const webhooksController = require('./controllers/webhooksController');
const usersController = require('./controllers/usersController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas de acesso, tente novamente em 15 minutos'
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://iaducena.b1mdigital.com.br'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas de autenticação
app.post('/api/auth/login', authController.login);
app.get('/api/auth/verify', authenticateToken, authController.verifyToken);

// Rotas de seções (protegidas)
app.get('/api/sections', authenticateToken, sectionsController.getSections);
app.post('/api/sections', authenticateToken, sectionsController.createSection);
app.put('/api/sections/reorder', authenticateToken, sectionsController.reorderSections);
app.put('/api/sections/:id', authenticateToken, sectionsController.updateSection);
app.delete('/api/sections/:id', authenticateToken, sectionsController.deleteSection);

// Rotas de configuração (protegidas)
app.post('/api/config/save', authenticateToken, sectionsController.saveConfiguration);
app.post('/api/config/update-products', authenticateToken, sectionsController.updateProducts);

// Rotas de webhooks (protegidas)
app.get('/api/webhooks', authenticateToken, webhooksController.getWebhooks);
app.post('/api/webhooks', authenticateToken, webhooksController.saveWebhook);
app.delete('/api/webhooks/:id', authenticateToken, webhooksController.deleteWebhook);

// Rotas de usuários (protegidas)
app.put('/api/users/profile', authenticateToken, usersController.updateProfile);
app.post('/api/users', authenticateToken, usersController.createUser);
app.get('/api/users', authenticateToken, usersController.getUsers);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar servidor
async function startServer() {
  try {
    // Testar conexão com banco
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }

    // Inicializar banco de dados
    await initializeDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
