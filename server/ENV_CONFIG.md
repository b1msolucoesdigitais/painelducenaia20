# Configuração do Servidor - Painel Ducena IA

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na pasta `server/` com o seguinte conteúdo:

```env
# Banco de Dados MySQL
DB_HOST=190.102.41.148
DB_NAME=bmdigita_iaducena
DB_USER=bmdigita_iaducena
DB_PASSWORD=@B41gke84

# JWT
JWT_SECRET=ducena_ia_jwt_secret_key_2024

# Servidor
PORT=5000
NODE_ENV=development
```

## Instruções de Configuração

1. **Criar arquivo .env:**
   ```bash
   cd server
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

2. **Instalar dependências:**
   ```bash
   cd server
   npm install
   ```

3. **Executar o servidor:**
   ```bash
   npm run dev
   ```

## Configurações de Produção

Para produção, altere as seguintes variáveis:

```env
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
PORT=5000
```

## Segurança

- **JWT_SECRET:** Use uma chave forte e única em produção
- **NODE_ENV:** Sempre defina como 'production' em produção
- **DB_PASSWORD:** Use senhas fortes para o banco de dados
