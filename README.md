# chat

chat is a Node/Express chat server with a MySQL database and an Electron client.

## Requirements

- Node.js
- MySQL Server
- MySQL command line client (`mysql`)

## Database Setup

The database schema is committed in `server/database/schema.sql`. It creates the `chat` database and the required tables: `users`, `chats`, and `msgs`.

From the project root:

```sh
cd server
cp .env.example .env
npm install
npm run db:setup
```

When prompted, enter your MySQL root password. If your local MySQL user is not `root`, edit `.env` and run the schema manually with your user:

```sh
mysql -u your_user -p < database/schema.sql
```

Make sure `.env` matches the database name created by the schema:

```env
DB_NAME=chat
DB_USER=root
DB_PASS= <your MYSQL password here>
DB_HOST=localhost
DB_DIALECT=mysql
DB_LOGGING=false
```

## Run The Server

```sh
cd server
npm start
```

## Run The Electron Client

In another terminal:

```sh
cd electron
npm install
npm run dev
```
```
