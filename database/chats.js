const Sequelize = require("sequelize")
const con = require("./dbcon")

const chats = con.define('chats', {
    prim: {
        type: Sequelize.INTEGER
    },
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true // CUIDADO SEMPRE COM ISSO
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    included_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    included_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    color: {
        type: Sequelize.STRING,
        allowNull: false
    },
    is_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
})


module.exports = chats