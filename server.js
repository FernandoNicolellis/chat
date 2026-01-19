// ---------------------- INITIALIZATION ----------------------
console.clear()
// ---- Server ----
const express = require("express")
const app = express()
const port = 1111

// ------------------- Talvez ver se arruma isso dps ---------------------------

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// ---- Handlebars ----
const { engine } = require("express-handlebars")
// Register the engine for files with the existing `.handlebars.html` extension
app.engine("handlebars.html", engine({ extname: '.handlebars.html', defaultLayout: 'main' }))
app.set("view engine", "handlebars.html")

// ---- Body Parser ----
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// ---- Multer ----
function justifyDate (date) {
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + '_' + date.getHours() + '-' + 
    + date.getMinutes() + '-' + date.getSeconds() + '_' + date.getMilliseconds() + '-'
}
const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/files')
    },
    filename: (req, file, cb) => {
        let date;
        User.findOne({where: {id: req.session.userid}}).then(res => {
            if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') fileType = 1
            else fileType = 2
            date = justifyDate(new Date())
            file.originalname = file.originalname.replace(/ /g, "")
            Msg.create({
                text: date + file.originalname,
                type: fileType,
                sender_id: req.session.userid,
                sender_name: res.name,
                chat_id: req.session.chat,
                date: '',
                time: ''
            })
        }).then(() => {
            file.originalname = date + file.originalname
            cb(null, file.originalname)
        })
    }

})

const upload = multer({storage})

// ---- Sessions ----
const session = require("express-session")
app.use(session({
    secret: "~12sd]32ç1^$*2141*!)~d~.;dASDãsdçl!Çdsaç9#*($s",
    resave: true,
    saveUninitialized: false
}))

// ---- Cookies ----
const cookieParser = require("cookie-parser")
app.use(cookieParser())

// ---- Public ----
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/uploads'))
// ---- Database ----
const dbcon = require("./database/dbcon")
const User = require("./database/user")
const Chats = require("./database/chats")
const Msg = require("./database/msg")

// ---------------------- CODE ----------------------



// Mudar o css

// Erro que aparece quando manda a imagem
// Erro do register
// Bug do scroll - renderização de imagem

// Eu adiciono a pessoa mas n atualiza automático -- Ta tudo com uma demora bem bizarra - esse atrasozinho


// ---- Functions ----
function genColor() {
    const colors = ['orange', 'cyan', 'greenyellow', 'pink', 'cornflowerblue', 'violet', 'aqua', 'blueviolet', 'crimson', 'green', 'yellow']
    const random = Math.floor(Math.random() * 5)
    return colors[random]
}
function newChat(chat_id, id, is_admin) {
    var repeat = false
    let name = ''
    let createdAt
    return Chats.findAll({where: {id: chat_id}}).then(res => {
        res.map(val => {
            if (val.included_id == id) repeat = true 
        })

        if (repeat == false) {
            if (res[0] != null) {
                createdAt = res[0].createdAt 
                if (res[0].name != null && res[0].name != '') name = res[0].name

                User.findOne({where: {id: id}}).then(res => {
                    Chats.create({
                        id: chat_id,
                        included_id: id,
                        included_name: res.name,
                        is_admin: is_admin,
                        name: name,
                        color: genColor(),
                        createdAt: createdAt
                    })
                })
            }
            else {
                User.findOne({where: {id: id}}).then(res => {
                    Chats.create({
                        id: chat_id,
                        included_id: id,
                        included_name: res.name,
                        is_admin: is_admin,
                        name: name,
                        color: genColor()
                    })
                })
            }
        }
        return repeat
    })
}
function newMsg(text, sender_id, chat_id) { 
    if (text != '' && text.length <= 800) {
        User.findOne({where: {id: sender_id}}).then(res => {
            Msg.create({
                text: text,
                type: 0,
                sender_id: sender_id,
                sender_name: res.name,
                chat_id: chat_id,
                date: '',
                time: ''
            })
        })
        
    }
    
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function displayDate(date) {
    
    let todayDate = new Date()
    let today = (todayDate.getDate()<=9?'0':'') + todayDate.getDate() + '/' + (todayDate.getMonth()<=9?'0':'') + todayDate.getMonth() + '/' + todayDate.getFullYear()
    
    let yesterDate = new Date()
    yesterDate.setDate(yesterDate.getDate() - 1)
    let yester = (yesterDate.getDate()<=9?'0':'') + yesterDate.getDate() + '/' + (yesterDate.getMonth()<=9?'0':'') + yesterDate.getMonth() + '/' + yesterDate.getFullYear()


    let given = (date.getDate()<=9?'0':'') + date.getDate() + '/' + (date.getMonth()<=9?'0':'') + date.getMonth() + '/' + date.getFullYear()

    if (given == today) return 'Hoje'
    else if (given == yester) return 'Ontem'
    else return given
}
const AdminID = 1
// ---- Routes ----

app.get('/', (req, res) => { 
    if (req.session.userid  == undefined) res.redirect('/login') 
    else {
        var included_chats = []
        var chats = []
        Chats.findAll({where: {included_id: req.session.userid}}).then(res => {
            res.map(val => {
                included_chats.push(val.id) 
            })
        }).then(() => {
            if (included_chats.length == 0){

                User.findAll().then(res => {
                    var arr = []
                    res.map(val => {
                        arr.push({ppl: val.name})
                    })
                    return arr

                }).then((arr) => {
                    res.render("index", {chats: [], this_chat: 0, all: arr}) 
                })

            }
            else {
                included_chats.map((included_val, indice) => {
                    Chats.findAll({where: {id: included_val}}).then(res => {
                        var ppl = []
                        res.map(val => {
                            
                            if (val.is_admin == 2) {}
                            else if (val.included_id != req.session.userid) {
                                ppl.push({
                                    name: (function () {
                                        let str = ''
                                        val.included_name.trim().split(' ').map((e, i) => {
                                            if (i == 0) str = capitalize(e)
                                            else if (i != 0) str += ' ' + e.charAt(0).toUpperCase()+'.'
                                        })
                                        return str
                                    })(), 
                                    id: '', 
                                    text: 'none', 
                                    is_admin: val.is_admin
                                })
                            }
                            else if (val.included_id == req.session.userid) {
                                ppl.push({
                                    name: (function () {
                                        let str = ''
                                        val.included_name.trim().split(' ').map((e, i) => {
                                            if (i == 0) str = capitalize(e)
                                            else if (i != 0) str += ' ' + e.charAt(0).toUpperCase()+'.'
                                        })
                                        return str
                                    })(), 
                                    id: 'me', 
                                    text: 'underline', 
                                    is_admin: val.is_admin
                                })
                            }
                            
                        })
                        chats.push({group: ppl, id: included_val, name: res[0].name, date: res[0].createdAt.toLocaleString("pt-br", {timeZone: "America/Sao_Paulo"})})
                    }).then(() => {
                        User.findAll().then(res => {
                            var arr = []
                            res.map(val => {
                                if (val.id != AdminID) arr.push({ppl: val.name})
                            })
                            return arr
    
                        }).then((arr) => {
                            if ((indice + 1) == included_chats.length) {

                                res.render("index", {chats: chats, this_chat: req.session.chat, all: arr})
                            }
                        })
                    })
                })
            }  
        })   
    }
})

app.post('/render', async (req, ent) => {
    if (req.session.chat != undefined) {
        
        const adm = await Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]})
    
        let pastMsgDate = new Date()
        let msgs = [];
        const res = await Msg.findAll({ where: { chat_id: req.session.chat } });
        for (const msg of res) {
            const color = await Chats.findOne({where: [{ included_name: msg.sender_name }, { id: req.session.chat }]})

            if (pastMsgDate.getDay() != msg.createdAt.getDay()) {
                msgs.push({else: "<div class=day > <p class=dayText >" + displayDate(msg.createdAt) +"</p> </div>"})
            }
            pastMsgDate = msg.createdAt

            if (color != null && color != undefined) resColor = color.color
            else resColor = 'lightgray'
            
            if (msg.type == 0) {
                if (msg.sender_id == req.session.userid) { 
                    const msgObject = {
                        open: "<div class='msg_2'> <span class='msg_text'>",
                        text: msg.text,
                        close: "</span> <p class=time >"+(msg.createdAt.getHours() <= 9?'0':'') + msg.createdAt.getHours() + ":" + (msg.createdAt.getMinutes() <= 9?'0':'') + msg.createdAt.getMinutes() +"</p> <div class=delMsg onclick=msgDel("+msg.id+") >🗑️</div></div>"
                    }
                    msgs.push({msg: msgObject});
                    
                } 
                else {
                    msg.sender_name.trim().split(" ").map((word, idx) => {
                        if (idx == 0) msg.sender_name = word + " ";
                        else msg.sender_name += word.charAt(0) + ". ";
                    });

                    const addOrNot = adm.is_admin?"<div class=delMsg onclick=msgDel("+msg.id+")> 🗑️ </div>":""
                    const msgObject = {
                        open: "<div class='msg_1'> <span style='color: " + resColor + "'>" + msg.sender_name + "</span> <p class=time >"+ (msg.createdAt.getHours() <= 9?'0':'') + msg.createdAt.getHours() + ":" + (msg.createdAt.getMinutes() <= 9?'0':'') + msg.createdAt.getMinutes() +"</p>"+ addOrNot +" <br> <span class='msg_text'>",
                        text: msg.text,
                        close:"</span> </div>" 
                    }
                    msgs.push({msg: msgObject});
                }
            }
            else if (msg.type == 1) {
                if (msg.sender_id == req.session.userid) {
                    app.use(express.static(__dirname + '/uploads'))
                    msgs.push({else: "<div class=img2> <img src=./files/"+msg.text+" class='displayIMG'> <br> <a class=fileAsm href=./files/"+msg.text+" download ><img src='./img/baixar.png' width=25px></a> " +
                    "<p class=time >"+ (msg.createdAt.getHours() <= 9?'0':'') + msg.createdAt.getHours() + ":" + (msg.createdAt.getMinutes() <= 9?'0':'') + msg.createdAt.getMinutes() +"</p> <div class=delMsg onclick=msgDel("+msg.id+")> 🗑️ </div> </div>"})
                }
                else {
                    const addOrNot = adm.is_admin?"<div class=delMsg onclick=msgDel("+msg.id+")> 🗑️ </div>":""
                    msg.sender_name.trim().split(" ").map((word, idx) => {
                        if (idx == 0) msg.sender_name = word + " ";
                        else msg.sender_name += word.charAt(0) + ". ";
                    });
                    app.use(express.static(__dirname + '/uploads'))
                    msgs.push({else: "<div class=img1> <span style='color: " + resColor + "'>" + 
                    msg.sender_name + "</span> <br> <img src=./files/"+msg.text+" class='displayIMG'> <br> <a class=fileAsm href=./files/"+msg.text+" download ><img src='./img/baixar.png' width=25px></a>" +
                    "<p class=time >"+ (msg.createdAt.getHours() <= 9?'0':'') + msg.createdAt.getHours() + ":" + (msg.createdAt.getMinutes() <= 9?'0':'') + msg.createdAt.getMinutes() +"</p> "+addOrNot+"</div> "})
                }
                
            }
            else if (msg.type == 2) {
                let extension = msg.text.split('.')
                if (msg.sender_id == req.session.userid) {
                    app.use(express.static(__dirname + '/uploads'))
                    msgs.push({else: "<div class=img2> <a class=fileA href=./files/"+msg.text+" download ><img src='./img/baixar.png' width=25px></a> <br>"+
                    "<span class=fileDlw>."+extension[extension.length - 1]+"</span> <p class=time >"+ (msg.createdAt.getHours() <= 9?'0':'') + msg.createdAt.getHours() + ":" + (msg.createdAt.getMinutes() <= 9?'0':'') + msg.createdAt.getMinutes() +"</p>  <div class=delMsg onclick=msgDel("+msg.id+")> 🗑️ </div> </div>"
                    })
                }
                else {
                    const addOrNot = adm.is_admin?"<div class=delMsg onclick=msgDel("+msg.id+")> 🗑️ </div>":""
                    msg.sender_name.trim().split(" ").map((word, idx) => {
                        if (idx == 0) msg.sender_name = word + " ";
                        else msg.sender_name += word.charAt(0) + ". ";
                    });
                    app.use(express.static(__dirname + '/uploads'))
                    msgs.push({else: "<div class=img1> <span style='color: " + resColor + "'>" + 
                    msg.sender_name + "</span> <br> <a class=fileA href=./files/"+msg.text+" download ><img src='./img/baixar.png' width=25px></a> <br>" +
                    "<span class=fileDlw>."+extension[extension.length - 1]+"</span> <p class=time >"+ (msg.createdAt.getHours() <= 9?'0':'') + msg.createdAt.getHours() + ":" + (msg.createdAt.getMinutes() <= 9?'0':'') + msg.createdAt.getMinutes() +"</p> "+addOrNot+"</div> "
                    })
                }
            }
            else if (msg.type == 3) {
                if (msg.sender_id == req.session.userid) { 
                    msgs.push({else: "<div class='msg_2'> <i> <span class='msg_text deletedMsg'> Mensagem apagada </span> </i> </div> "});
                } 
                else {
                    msg.sender_name.trim().split(" ").map((word, idx) => {
                        if (idx == 0) msg.sender_name = word + " ";
                        else msg.sender_name += word.charAt(0) + ". ";
                    });
                    msgs.push({else: "<div class='msg_1'> <span style='color: " + resColor + "'>" + msg.sender_name + "</span> <br> <i> <span class='msg_text deletedMsg'> Mensagem apagada </span> </i> </div> "});
                }
            }
        }
        ent.send(msgs)
    } 
    else {
        ent.send([]);
    }
})

app.post('/deslog', (req, res) => {
    req.session.userid = undefined
    req.session.chat = undefined
    res.send()
})

app.post('/change_chat', (req, res) => {
    Chats.findAll({where: {included_id: req.session.userid}})
    .then(res => {
        res.map(val => {
            if (req.body.id == val.id) req.session.chat = req.body.id 
            if (req.session.id == 5) req.session.chat = req.body.id 
        })
    }).then(() => {
        res.send()
    })

    
})

app.post('/new_msg', (req, res) => {
    if (req.session.chat != undefined && req.session.userid != AdminID) {
        newMsg(req.body.text, req.session.userid, req.session.chat) // Antes do cara mandar a msg, ele tem que mudar o chat né
    }
    else {
        console.log("Chat indefinido")
    }
    res.send()
})

app.post('/newChat', (req, res) => {
    Chats.findAll().then(res => {
        var IDs = []
        res.map(val => {
            IDs.push(val.id)
        })

        if (IDs.length <= 0) var HigherChat = 0
        else var HigherChat = Math.max.apply(null, IDs) 

        if (req.session.userid != AdminID) {
            newChat(HigherChat + 1, req.session.userid, true)
            newChat(HigherChat + 1, AdminID, 2)
            req.session.chat = HigherChat + 1
        }
        
    }).then(() => {res.send()})
    
})

app.post('/addChatPeople', (req, res) => {
    Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(res => {
        if (res.is_admin) {
            return User.findOne({where: {name: req.body.ppl}}).then(val => {
                if (val != null && val.is_admin != 2) {
                    return newChat(req.session.chat, val.id, false).then(res => {
                        return res
                    })
                }    
            })
        }
    }).then((rep) => {
        res.send({rep: rep})
    })  
})

app.post('/admAdd', (req, res) => {
    Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(res => {
        if (res.is_admin) {
            return Chats.findOne({where: [{id: req.session.chat}, {included_name: req.body.ppl}]}).then(res => {
                
                if (res != null && res.included_id != req.session.userid && res.is_admin != 2) {
                    if (!res.is_admin) Chats.update({is_admin: true}, {where: [{id: res.id}, {included_id: res.included_id}]})
                    else if (res.is_admin) Chats.update({is_admin: false}, {where: [{id: res.id}, {included_id: res.included_id}]})
                    return false
                }
                else return true
            })
        }
        
    }).then((rep) => {
        res.send({rep: rep})
    })
})

app.post('/delPpl', (req, res) => {
    Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(res => {
        if (res.is_admin && res.included_name.trim() != req.body.ppl.trim()) {
            if (req.body.ppl.trim() != 'Admin') {
                Chats.destroy({where: [{id: res.id}, {included_name: req.body.ppl.trim()}]})  
                return false
            }
            else {
                return true
            }
        }
        else return true
        
    }).then((rep) => {
        res.send({rep: rep})
    })
})

app.post('/delMe', (req, resp) => {
    Chats.findAll({where: [{id: req.session.chat}, {is_admin: true}]}).then(res => {
        return Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(is => {
            if (res.length <= 1 && is.is_admin) {
                return Chats.findAll({where: {id: req.session.chat}}).then(ppl => {
                    if (ppl.length <= 2 && req.session.userid != AdminID) {
                        Chats.destroy({where: [{id: req.session.chat}, {included_id: req.session.userid}]})
                        Chats.destroy({where: [{id: req.session.chat}, {included_id: AdminID}]})
                        Msg.destroy({where: {chat_id: req.session.chat}})
                        req.session.chat = undefined
                        return false
                    }
                    else return true
                })
            }
            else {
                Chats.destroy({where: [{id: req.session.chat}, {included_id: req.session.userid}]})
                req.session.chat = undefined
                return false
            }
        })
    }).then((rep) => {
        resp.send({rep: rep})
    })
    
})

app.post('/nameGroup', (req, res) => {
    Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(res => {
        if (res.is_admin) {
            Chats.update(
                {name: req.body.name},
                {where: {id: req.session.chat}}
            )
            return false
        }
        else return true
    }).then(rep => {
        res.send({rep: rep})
    })
})

app.post('/fileUpload', upload.single('file'))

app.post('/delMsg', async (req, res) => {
    const msg = await Msg.findOne({where: [{id: req.body.id}, {sender_id: req.session.userid}]}) 
    if (msg != undefined) {
        await Msg.update({type: 3},{where: {id: req.body.id}})
    }
    else {
        const adm = await Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]})
        if (adm.is_admin) {
            await Msg.update({type: 3}, {where: {id: req.body.id}})
        }
    }
    
    res.send() 
})


// ---- External routes ----
const registerRoute = require("./routes/register")
app.use('/register', registerRoute)

const loginRoute = require("./routes/login");
app.use('/login', loginRoute)


// ---- Error route ----
app.get('*', (req, res) => {
    res.status(404).render('err404', {link: 'http://' + req.hostname + ':' + port + req.path})
})

app.listen(port, () => console.log('----------- Servidor rodando na URL localhost:' + port + ' -----------')) 