require('dotenv').config()
const Sequelize = require("sequelize")

const dbName = process.env.DB_NAME || "fechat"
const dbUser = process.env.DB_USER || "root"
const dbPass = process.env.DB_PASS || ""
const dbHost = process.env.DB_HOST || "localhost"
const dbDialect = process.env.DB_DIALECT || "mysql"
const dbLogging = process.env.DB_LOGGING === 'true' ? true : false

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    dialect: dbDialect,
    host: dbHost,
    logging: dbLogging
})

module.exports = sequelize