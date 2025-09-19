# Instruções de Execução - Painel Ducena IA

## 🚀 Como executar o projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Acesso ao banco de dados MySQL configurado

### 1. Instalar dependências

```bash
# Na raiz do projeto
npm run install-all
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `server/` com as seguintes variáveis:

```env
DB_HOST=190.102.41.148
DB_NAME=bmdigita_iaducena
DB_USER=bmdigita_iaducena
DB_PASSWORD=@B41gke84
JWT_SECRET=ducena_ia_jwt_secret_key_2024
PORT=5000
NODE_ENV=development
```

### 3. Executar o projeto

```bash
# Na raiz do projeto
npm run dev
```

Isso irá executar:
- Backend na porta 5000 (http://localhost:5000)
- Frontend na porta 3000 (http://localhost:3000)

### 4. Acessar o painel

1. Abra seu navegador em: http://localhost:3000
2. Use as credenciais padrão:
   - **Email:** admin@ducena.com
   - **Senha:** admin123

## 📋 Funcionalidades Disponíveis

### ✅ Implementadas
- [x] Sistema de autenticação JWT
- [x] CRUD completo de seções
- [x] Drag-and-drop para reordenar seções
- [x] Modais fullscreen para edição
- [x] Sistema de webhooks configurável
- [x] Interface responsiva e moderna
- [x] Auto-save e persistência
- [x] Validação de formulários
- [x] Notificações toast

### 🔧 Configurações de Webhook

1. Clique em "Configurações" no menu lateral
2. Configure as URLs dos webhooks:
   - **Webhook de Salvamento:** Recebe seções + prompt completo
   - **Webhook de Atualização:** Recebe apenas POST simples

### 📤 Formato dos Dados dos Webhooks

**Webhook de Salvamento:**
```json
{
  "sections": [
    {
      "title": "Introdução",
      "content": "Você é um assistente..."
    }
  ],
  "full_prompt": "## Introdução\n\nVocê é um assistente..."
}
```

**Webhook de Atualização:**
```json
{}
```

## 🗄️ Estrutura do Banco de Dados

O sistema criará automaticamente as seguintes tabelas:

- `users`: Usuários do sistema
- `sections`: Seções de prompt configuráveis
- `webhooks`: URLs para integração externa

## 🛠️ Comandos Úteis

```bash
# Executar apenas o backend
npm run server

# Executar apenas o frontend
npm run client

# Build para produção
npm run build
```

## 🔍 Troubleshooting

### Problemas comuns:

1. **Erro de conexão com banco:**
   - Verifique se as credenciais estão corretas
   - Confirme se o servidor MySQL está rodando

2. **Erro de CORS:**
   - O backend já está configurado para aceitar requisições do frontend

3. **Token expirado:**
   - O sistema redireciona automaticamente para login

## 📱 Responsividade

O painel é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🔒 Segurança

- Autenticação JWT com expiração de 24h
- Senhas criptografadas com bcrypt
- Rate limiting configurado
- Headers de segurança com Helmet
- Validação de entrada em todas as APIs
