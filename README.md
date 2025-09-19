# Painel Ducena IA

Painel web moderno para configuração de prompts de IA com autenticação e integração a banco de dados SQL.

## 🚀 Funcionalidades

- **Autenticação**: Login seguro com JWT
- **Gerenciamento de Seções**: Criar, editar, excluir e reordenar seções de prompt
- **Edição Fullscreen**: Modais para edição completa das seções
- **Webhooks**: Integração com sistemas externos
- **Interface Moderna**: Design responsivo e intuitivo

## 🛠️ Tecnologias

- **Backend**: Node.js + Express + MySQL
- **Frontend**: React + Tailwind CSS + Zustand
- **Autenticação**: JWT
- **Banco de Dados**: MySQL

## 📦 Instalação

```bash
# Instalar todas as dependências
npm run install-all

# Executar em modo desenvolvimento
npm run dev
```

## 🗄️ Banco de Dados

O projeto utiliza MySQL com as seguintes tabelas:
- `users`: Usuários do sistema
- `sections`: Seções de prompt configuráveis
- `webhooks`: URLs para integração externa

## 🔧 Configuração

Configure as variáveis de ambiente no arquivo `.env` do servidor:

```env
DB_HOST=190.102.41.148
DB_NAME=bmdigita_iaducena
DB_USER=bmdigita_iaducena
DB_PASSWORD=@B41gke84
JWT_SECRET=seu_jwt_secret_aqui
PORT=5000
```

## 📱 Uso

1. Acesse o painel web
2. Faça login com suas credenciais
3. Configure as seções de prompt
4. Salve a configuração ou atualize produtos via webhooks