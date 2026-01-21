# chatPro

Sistema de chat com backend (Node.js/Express/MySQL) e frontend (Electron + Bootstrap 5).

## Pré-requisitos
- Node.js 18+
- MySQL
- npm

## Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd chatPro
```

### 2. Backend
```bash
cd backend
cp .env.example .env 
edite as variaveis
npm install
```

Crie um novo banco de dados banco de dados MySQL

#### Crie um usuário manualmente:
```bash
node src/createUser.js
```

### 3. Frontend
```bash
cd ../frontend
npm install
```

## Como rodar

### 1. Inicie o backend
```bash
cd backend
npm start
```

### 2. Inicie o frontend (Electron)
```bash
cd ../frontend
npm start
```

## Funcionalidades
- Login de usuário
- Chat entre todos os usuários cadastrados
- Notificações de novas mensagens
- Contador de mensagens não lidas
- Interface moderna com Bootstrap 5

## Observações
- O backend precisa estar rodando antes de abrir o frontend.
- O backend usa as variáveis do arquivo `.env` para conectar ao MySQL.
- Para criar novos usuários, use o comando `node src/createUser.js` no backend.

---

Desenvolvido por Fernando Nicolellis.
