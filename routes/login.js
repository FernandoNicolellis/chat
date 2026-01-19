const express = require("express")
const router = express.Router()
const User = require("../database/user")
const crypto = require("crypto")

const transport = require("../database/email")

const secret = "~3124sdaçdsaç1~sd]asda~[[!$@!3$#512!#!@#%#53)%*&#(2341234"
const encrypt = value => {
    const hash = crypto.createHmac('sha256', secret)
    .update(value)
    .digest('hex')
    return hash
}

router.get("/", (req, res) => {
    if (req.session.userid == undefined) {
        res.render("register/login", {email: req.cookies.email, pass: req.cookies.pass}) // Passa os cookies
    }
    else {
        res.redirect('/')
    }
    
    
})

router.post("/new_login", (req, res) => {

    var data = req.body
    var send = []

    var createAlert = function (text, alert_type) {
        send.push({
           text: text,
           classes: "alert " + alert_type
        })
    }
    
    User.findOne({where: {email: data.email}}).then(SQL => {

        if (SQL == null) createAlert("E-mail não cadastrado", "alert-danger")
        else {
            if (SQL.pass == encrypt(data.pass)) {
                createAlert("script", "alert-success")
                req.session.userid = SQL.id // Passando a sessão (no servidor) chamada de userid para receber o valor de autoincremento da tabela SQL
                
                if (data.check) { // Salva os cookies apenas se lá no cliente o cara selecionou a caixinha que a gente quer
                    res.cookie('email', data.email)
                    res.cookie('pass', data.pass)
                }
                else if (!data.check) {
                    res.cookie('email', '')
                    res.cookie('pass', '')
                }
            }
            else if (SQL.pass != encrypt(data.pass)) {
                createAlert("Senha não corresponde ao e-mail cadastrado", "alert-danger")
            }
        }
    }).then(() => res.send({data: send}))
    
    
})

module.exports = router