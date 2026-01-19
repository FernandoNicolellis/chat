const Sequelize = require("sequelize")
const sequelize = new Sequelize("fechat", "root", "Nico123_", {
    dialect: "mysql",
    host: "localhost",
    logging: false
})

module.exports = sequelize