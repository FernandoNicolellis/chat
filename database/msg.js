const Sequelize = require("sequelize")
const con = require("./dbcon")

const Msg = con.define('msg', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    text: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    sender_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    chat_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    date: {
        type: Sequelize.STRING,
        allowNull: false
    },
    time: {
        type: Sequelize.STRING,
        allowNull: false
    }
})


module.exports = Msg