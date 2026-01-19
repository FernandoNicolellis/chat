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
        res.render('register/register')
    } else {
        res.redirect('/')
    }
})

// kept for backward compatibility: any code route redirects to login
router.get("/:code", (req, res) => {
    if (req.session.userid == undefined) {
        // preserve legacy link `/register/0` used in the UI to open the register page
        if (req.params.code === '0') return res.render('register/register')
        return res.redirect('/login')
    } else {
        res.redirect('/')
    }
})

router.post("/new_register", async (req, res) => {
    try {
        const data = req.body
        const send = []

        const createAlert = function (text, alert_type) {
            send.push({ text: text, classes: "alert " + alert_type })
        }

        function capitalize(string) { return string.charAt(0).toUpperCase() + string.slice(1); }
        function capitalizeAll(string) { let ret = ''; string.split(' ').map(e => ret += capitalize(e) + ' '); return ret }

        data.name = capitalizeAll(data.name.toLowerCase())
        data.email = data.email.toLowerCase()

        if (data.name.length <= 5) createAlert("Campo de nome com caracteres insuficientes", "alert-danger")
        if (data.email.length <= 5) createAlert("Campo de email com caracteres insuficientes", "alert-danger")
        if (data.pass.length <= 5) createAlert("Campo de senha com caracteres insuficientes", "alert-danger")
        if (data.name.length > 50) createAlert("Campo de nome com muitos caracteres", "alert-danger")
        if (data.email.length > 50) createAlert("Campo de email com muitos caracteres", "alert-danger")
        if (data.pass.length > 50) createAlert("Campo de senha com muitos caracteres", "alert-danger")
        if (data.pass != data.pass_rep) createAlert("Senhas repetidas diferentes", "alert-danger")

        const SQL_name = await User.findOne({ where: { name: data.name.trim() } })
        const SQL = await User.findOne({ where: { email: data.email.trim() } })

        if (SQL == null && SQL_name == null) {
            if (data.email.length > 5 && data.email.length <= 50
                && data.pass.length > 5 && data.pass.length <= 50 && data.pass == data.pass_rep
                && data.name.length > 5 && data.name.length <= 50) {

                // create the user immediately (no email verification)
                try {
                    await User.create({
                        name: data.name.trim(),
                        email: data.email.trim(),
                        pass: encrypt(data.pass)
                    })
                    createAlert("Cadastro realizado com sucesso. Faça login.", "alert-success")
                    // pre-fill login email cookie for convenience
                    res.cookie('email', data.email.trim())
                    res.cookie('pass', '')
                }
                catch (err) {
                    console.error(err)
                    createAlert("Erro ao criar usuário", "alert-danger")
                }
            }
        } else {
            if (SQL != null) createAlert("E-mail já cadastrado", "alert-danger")
            if (SQL_name != null) createAlert("Nome já cadastrado", "alert-danger")
        }

        return res.send({ data: send })
    }
    catch (err) {
        console.error(err)
        return res.status(500).send({ data: [{ text: 'Erro interno', classes: 'alert alert-danger' }] })
    }
})



module.exports = router