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

router.get("/:code" , (req, res) => {
    if (req.session.userid == undefined) { 
        if (req.params.code == req.session.userVerification) {
            User.create(req.session.userPending)
            req.session.userVerification = null

            res.cookie("email", req.session.userPending.email)
            res.cookie("pass", '')

            res.redirect("/login")
        }
        else {
            res.render('register/register')
        }
    }
    else {
        res.redirect("/")
    }
    req.session.userVerification = null
})

router.post("/new_register", (req, res) => {
    
    var data = req.body
    var send = []

    const createAlert = function (text, alert_type) {
        send.push({
           text: text,
           classes: "alert " + alert_type
        })
    }
    
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function capitalizeAll(string) {
        let ret = ''
        string.split(' ').map(e => ret += capitalize(e) + ' ')
        return ret
    }

    
    data.name = capitalizeAll(data.name.toLowerCase())
    data.email = data.email.toLowerCase()
    
    if (data.name.length <= 5) createAlert("Campo de nome com caracteres insuficientes", "alert-danger")
    if (data.email.length <= 5) createAlert("Campo de email com caracteres insuficientes", "alert-danger")
    if (data.pass.length <= 5) createAlert("Campo de senha com caracteres insuficientes", "alert-danger")
    
    if (data.name.length > 50) createAlert("Campo de nome com muitos caracteres", "alert-danger")
    if (data.email.length > 50) createAlert("Campo de email com muitos caracteres", "alert-danger")
    if (data.pass.length > 50) createAlert("Campo de senha com muitos caracteres", "alert-danger")
    
    if (data.pass != data.pass_rep) createAlert("Senhas repetidas diferentes", "alert-danger")

    User.findOne({where: {name: data.name.trim()}}).then(SQL_name => {
        return SQL_name
    }).then(SQL_name => {
        User.findOne({where: {email: data.email.trim()}}).then(SQL => {
            if (SQL == null && SQL_name == null) {
                if (data.email.length > 5 && data.email.length <= 50
                    && data.pass.length > 5 && data.pass.length <= 50 && data.pass == data.pass_rep 
                    && data.name.length > 5 && data.name.length <= 50) {
                            
                    createAlert("Tudo certo! Confirme seu email (cheque a caixa de spam)", "alert-success")
                    req.session.userPending = {
                        name: data.name.trim(),
                        email: data.email.trim(),
                        pass: encrypt(data.pass)
                    }
                    req.session.userVerification = String(Math.floor(1 + Math.random() * 9)) + String(Math.floor(1 + Math.random() * 9)) + String(Math.floor(1 + Math.random() * 9)) + String(Math.floor(1 + Math.random() * 9)) + String(Math.floor(1 + Math.random() * 9))
                    
                    transport.sendMail({
                        from: 'Chat de comunicação',
                        to: data.email.trim(),
                        subject: data.name.trim() + ', verifique sua conta no chat de comunicação',
                        html: "<div style='position: absolute; top: 0; left: 0; right: 0; bottom: 0; position: absolute; margin: auto; width: fit-content; height: fit-content; text-align: center;border: 3px solid black; border-radius: 5px; padding: 30px; background-color: rgb(200, 200, 200);'><span style='font-size: 20px; font-family: Arial, sans-serif;'>Clique neste link para verificar seu email</span> <br> <a href=http://localhost:1111/register/"+req.session.userVerification+" style='text-decoration: none;'> <span style='font-size: 20px; font-weight: 600; font-family: Arial, sans-serif;'>localhost:1111/register/"+req.session.userVerification+"</span> </a><br><span style='font-size: 15px; font-family: Arial, sans-serif;'>Se tudo der certo, você será redirecionado para a página de login</span> <br></div>"
                    }).catch(err => {
                        console.log(err)
                    })
    
                    console.log(req.session.userVerification)
                    
                }
            }
            else {
                if (SQL != null) {
                    createAlert("E-mail já cadastrado", "alert-danger")
                }
                if (SQL_name != null) {
                    createAlert("Nome já cadastrado", "alert-danger")
                }
            }
        }).then(() => {
            res.send({data: send})
        })
    })
     
    

})



module.exports = router