// ---------------------- INITIALIZATION ----------------------
console.clear()
// ---- Server ----
const express = require("express")
const app = express()
const http = require("http")
const port = 1111
const adminID = 10000

const { Server } = require("socket.io")
const server = http.createServer(app)
const io = new Server(server)

// ------------------- Talvez ver se arruma isso dps ---------------------------

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// ---- Handlebars ----
const { engine } = require("express-handlebars")
app.engine("handlebars", engine({ extname: '.handlebars', defaultLayout: 'main' }))
app.set("view engine", "handlebars")

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
        if (req.session.userid == 10000 || req.session.userid == undefined || req.session.chatId == undefined) return
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
                read: String(req.session.userid) + ','
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

// ---- Essenciais ----
// Melhorar o CSS
// Exibir o nome do arquivo no envio
// Quando alguem sair do chatPRO, da pro

// ---- Não essenciais ----
// O bgl de recarregar a pagina só existe quando adiciona alguem a um grupo, nao quando tira alguem ou transforma em adm 

// Bug do scroll - renderização de imagem - +- Resolvido com timeout


// ---- Functions ----
function genColor() {
    const colors = ['orange', 
                    'cyan', 
                    'greenyellow', 
                    'pink', 
                    'cornflowerblue', 
                    'violet', 
                    'aqua', 
                    'blueviolet', 
                    'crimson', 
                    'green', 
                    'yellow',
                    'lime',
                    'magenta',  
                    'turquoise',
                    'salmon',
                    'orchid',
                    ];
    const random = Math.floor(Math.random() * 16)
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
                        createdAt: createdAt,
                        chatType: 0
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
                        color: genColor(),
                        chatType: 0
                    })
                })
            }
        }
        return repeat
    })
}
function newMsg(text, sender_id, chat_id) {
    if (text != '' /*&& text.length <= 800*/) {
        return User.findOne({ where: { id: sender_id } }).then(res => {
            return Msg.create({
                text: text,
                type: 0,
                sender_id: sender_id,
                sender_name: res.name,
                chat_id: chat_id,
                read: String(sender_id) + ','
            })
        })
    }
    return Promise.resolve()
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

// Socket.io
io.on("connection", (socket) => {
    socket.on("registerUser", (userId) => {
        if (!userId) return
        socket.join(`user:${userId}`)
    })
})

// ---- Routes ----

app.get('/', async (req, res) => { 
    if (req.session.userid  == undefined) return res.redirect('/login') 
    else if (req.session.userid == adminID) return res.redirect('/admin')
    else {
        var included_chats = [] // IDs dos chats que a pessoa faz parte
        var chats = [] 
        let peoplesNames = []

        await Chats.findAll({where: {included_id: req.session.userid}}).then(prov => {
            prov.map(val => included_chats.push(val.id))
        })
        await User.findAll().then(prov => {
            prov.map(val =>  peoplesNames.push({ppl: val.name}))
        })

        if (included_chats.length > 0) {
            for (let included_val of included_chats) {
                let pendingMessages = 0
                await Chats.findAll({where: {id: included_val}}).then(async prov => {
                    var ppl = []
                    prov.map(val => {
                        if (val.included_id != req.session.userid) {
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
                            if (val.chatType == 0) {
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
                        }   
                    })
                    let lastMessage = 0
                    await Msg.findAll({where: {chat_id: included_val}}).then(prov => {
                        prov.map(Pval => { if (!Pval.read.split(',').includes(String(req.session.userid))) pendingMessages += 1 })
                        if (prov.length >= 1) lastMessage = prov[prov.length-1].createdAt
                    })      
                    if (pendingMessages == 0) pendingMessages = false         
                    chats.push({group: ppl, 
                                id: included_val, 
                                name: prov[0].name, 
                                color: (() => {if (prov[0].chatType == 0) return '#5a5ad3'; else return '#6c757d'})(), 
                                date: prov[0].createdAt.toLocaleString("pt-br", {timeZone: "America/Sao_Paulo"}),
                                pendingMessages: pendingMessages,  
                                mostRecentMessage: Date.parse(lastMessage) 
                            })
                })
            }

            chats.sort((a, b) => b.mostRecentMessage - a.mostRecentMessage)
            res.render("index", {chats: chats, this_chat: req.session.chat, all: peoplesNames})
        }  
        else res.render("index", {chats: [], this_chat: 0, all: peoplesNames})
           
    }
})

app.get('/admin', async (req, res) => {
    if (req.session.userid != adminID) return res.redirect('/')
    else {
        var included_chats = [] // IDs dos chats que a pessoa faz parte
        var chats = [] 
        let peoplesNames = []

        await Chats.findAll().then(prov => {
            prov.map(val => {
                if (!included_chats.includes(val.id)) {
                included_chats.push(val.id)}
            })
        })
        await User.findAll().then(prov => {
            prov.map(val =>  peoplesNames.push({ppl: val.name}))
        })

        if (included_chats.length > 0) {
            for (let included_val of included_chats) {
                let pendingMessages = 0
                await Chats.findAll({where: {id: included_val}}).then(async prov => {
                    var ppl = []
                    prov.map(val => {
                        if (val.included_id != req.session.userid) {
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
                    })
                    let lastMessage = 0
                    await Msg.findAll({where: {chat_id: included_val}}).then(prov => {
                        prov.map(Pval => { 
                            if (!Pval.read.split(',').includes(String(req.session.userid))) pendingMessages += 1   
                            if (prov.length >= 1) lastMessage = prov[prov.length-1].createdAt  
                        })
                    })      
                    if (pendingMessages == 0) pendingMessages = false         
                    chats.push({group: ppl, 
                                id: included_val, 
                                name: prov[0].name, 
                                color: (() => {if (prov[0].chatType == 0) return '#5a5ad3'; else return '#6c757d'})(), 
                                date: prov[0].createdAt.toLocaleString("pt-br", {timeZone: "America/Sao_Paulo"}),
                                pendingMessages: pendingMessages,
                                mostRecentMessage: Date.parse(lastMessage)
                            })
                })
            }
            chats.sort((a, b) => b.mostRecentMessage - a.mostRecentMessage)
            res.render("index", {chats: chats, this_chat: req.session.chat, all: peoplesNames})
        }  
        else res.render("index", {chats: [], this_chat: 0, all: peoplesNames})
    
    }
})

app.get("/me", (req, res) => {
    if (!req.session.userid) return res.status(401).send({});
    res.send({ userId: req.session.userid });
});

app.post('/render', async (req, ent) => {
    if (req.session.chat != undefined) {
        
        if (req.session.userid != adminID) {
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
                
                if (msg.type == 0) { // Mensagem de texto
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
                else if (msg.type == 1) { // Imagem
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
                else if (msg.type == 2) { // Arquivo
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
                else if (msg.type == 3) { // Mensagem apagada
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
            
            await Msg.findAll({where: {chat_id: req.session.chat}}).then(res => {
                
                res.map(val => {
                    let readIds = []
                    if (val.read != null) {
                        val.read.split(',').map(prov => {
                            readIds.push(Number(prov))
                        })
                    }
                    else val.read = '' // Inutil na pratica, mas deixar por segurança.
                    if (!readIds.includes(req.session.userid)) {
                        Msg.update({read: val.read + String(req.session.userid) + ','}, {where: {id: val.id}})
                    }            
                })
            })

            ent.send(msgs)
        }
        else {
            const adm = false 
        
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
                
                if (msg.type == 0) { // Mensagem de texto
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
                else if (msg.type == 1) { // Imagem

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
                else if (msg.type == 2) { // Arquivo
                    let extension = msg.text.split('.')
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
                else if (msg.type == 3) { // Mensagem apagada // Ficar texto em vermelho mas nao sumir o texto
                      
                    msg.sender_name.trim().split(" ").map((word, idx) => {
                        if (idx == 0) msg.sender_name = word + " ";
                        else msg.sender_name += word.charAt(0) + ". ";
                    });
                    const addOrNot = adm.is_admin?"<div class=delMsg onclick=msgDel("+msg.id+")> 🗑️ </div>":""
                    const msgObject = {
                        open: "<div class='msg_1'> <span style='color: " + resColor + "'>" + msg.sender_name + "</span> <p class=time >"+ (msg.createdAt.getHours() <= 9?'0':'') + msg.createdAt.getHours() + ":" + (msg.createdAt.getMinutes() <= 9?'0':'') + msg.createdAt.getMinutes() +"</p>"+ addOrNot +" <br> <span style='color: red;' class='msg_text'>",
                        text: msg.text,
                        close:"</span> </div>" 
                    }
                    msgs.push({msg: msgObject});
                    
                }
            }
            
            await Msg.findAll({where: {chat_id: req.session.chat}}).then(res => {
                
                res.map(val => {
                    let readIds = []
                    if (val.read != null) {
                        val.read.split(',').map(prov => {
                            readIds.push(Number(prov))
                        })
                    }
                    else val.read = '' // Inutil na pratica, mas deixar por segurança.
                    if (!readIds.includes(req.session.userid)) {
                        Msg.update({read: val.read + String(req.session.userid) + ','}, {where: {id: val.id}})
                    }            
                })
            })

            ent.send(msgs)
        }
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
    if (req.session.userid == adminID) {
        req.session.chat = req.body.id
        return res.send({chat: req.session.chat})
    }
    Chats.findAll({where: {included_id: req.session.userid}})
    .then(res => {
        res.map(val => {
            if (req.body.id == val.id) req.session.chat = req.body.id // Feito para evitar que a pessoa consiga acessar um chat que não faz parte, já que o front só renderiza os chats que a pessoa faz parte, mas mesmo assim tem esse if para garantir que a pessoa não consiga acessar um chat que não faz parte (basta colocar o id do chat na requisição)   
        })
    }).then(() => {
        res.send({chat: req.session.chat})
    })

})

app.post('/new_msg', async (req, res) => {
    if (req.session.chat != undefined && req.session.userid != adminID) {
        let sender_name = ''
        let chatName = ''
        
        await newMsg(req.body.text, req.session.userid, req.session.chat) 
        
        await Chats.findOne({where: [{id: req.session.chat}]}).then(res => {
            if (res.name == null || res.name == '' || res.name == undefined) {
                if (res.chatType == 1) chatName = "Privado"
                else chatName = "Grupo sem nome"
            }
            else chatName = res.name
        })
        await User.findOne({where: {id: req.session.userid}}).then(user => sender_name = user.name )

        await Chats.findAll({where: {id: req.session.chat}})
        .then(res => {
            res.push({included_id: adminID}) // Para o admin receber a mensagem via socket, já que ele não tem registros na tabela de chats
            res.map(val => {
                if (req.body.text != '') io.to("user:"+val.included_id).emit("newMessage", { chatId: req.session.chat, chatName: chatName, sender_name: sender_name, text: req.body.text });
                
            })
        }).then(() => {
            res.send()
        })
    }
    else {
        console.log("Chat indefinido || Admin não pode enviar mensagens")
    }
    res.send()
})

app.post('/fileUpload', upload.single('file'), async (req, res) => {
    if (req.session.chat != undefined && req.session.userid != adminID) {
        await Chats.findOne({where: [{id: req.session.chat}]}).then(res => {
            if (res.name == null || res.name == '' || res.name == undefined) {
                if (res.chatType == 1) chatName = "Privado"
                else chatName = "Grupo sem nome"
            }
            else chatName = res.name
        })

        
        await Chats.findOne({where: [{id: req.session.chat}]}).then(res => {
            if (res.name == null || res.name == '' || res.name == undefined) {
                if (res.chatType == 1) chatName = "Privado"
                else chatName = "Grupo sem nome"
            }
            else chatName = res.name
        })
        await User.findOne({where: {id: req.session.userid}}).then(user => sender_name = user.name )

        await Chats.findAll({where: {id: req.session.chat}})
        .then(res => {
            res.push({included_id: adminID})
            res.map(val => {
                if (req.file != undefined) io.to("user:"+val.included_id).emit("newMessage", { chatId: req.session.chat, chatName: chatName, sender_name: sender_name, text: req.body.text });
            })
        }).then(() => {
            res.send()
        })
    }
    else {
        console.log("Chat indefinido || Admin não pode enviar mensagens")
    }
    res.send()
})

app.post('/newChat', (req, res) => {
    if (req.session.userid == adminID || req.session.userid == undefined) return res.send()
    Chats.findAll().then(res => {
        var IDs = []
        res.map(val => {
            IDs.push(val.id)
        })

        if (IDs.length <= 0) var HigherChat = 0
        else var HigherChat = Math.max.apply(null, IDs) 
       
        newChat(HigherChat + 1, req.session.userid, true)    
        req.session.chat = HigherChat + 1
       
        
    }).then(() => {res.send()})
    
})

app.post('/addChatPeople', (req, res) => {
    if (req.session.userid == adminID || req.session.userid == undefined) return res.send()
    Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(res => {
        if (res.is_admin && res.chatType == 0) {
            return User.findOne({where: {name: req.body.ppl}}).then(val => {
                if (val != null && val.is_admin != 2) {
                    io.to("user:"+val.id).emit("reloadCanvas")
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
    if (req.session.userid == adminID || req.session.userid == undefined) return res.send()
    Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(res => {
        if (res.is_admin && res.chatType == 0) {
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
    if (req.session.userid == adminID || req.session.userid == undefined) return res.send()
    Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(res => {
        if (res.is_admin && res.included_name.trim() != req.body.ppl.trim() && res.chatType == 0) {
            if (req.body.ppl.trim() != 'Admin') {
                Chats.destroy({where: [{id: res.id}, {included_name: req.body.ppl.trim()}]})  
                //io.to("user:"+).emit("reloadCanvas")
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
    if (req.session.userid == adminID || req.session.userid == undefined) return resp.send()
    Chats.findAll({where: [{id: req.session.chat}, {is_admin: true}]}).then(res => {
        return Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]}).then(is => {
            if (is.chatType == 1) return true
            else if (res.length <= 1 && is.is_admin) {
                return Chats.findAll({where: {id: req.session.chat}}).then(ppl => {
                    if (ppl.length <= 2) {
                        Chats.destroy({where: [{id: req.session.chat}, {included_id: req.session.userid}]})
                        //Msg.destroy({where: {chat_id: req.session.chat}})
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
    if (req.session.userid == adminID || req.session.userid == undefined) return res.send()
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

app.post('/delMsg', async (req, res) => {
    if (req.session.userid == adminID || req.session.userid == undefined) return res.send()

    const msg = await Msg.findOne({where: [{id: req.body.id}, {sender_id: req.session.userid}]}) 
    if (msg != undefined) {
        await Msg.update({type: 3},{where: {id: req.body.id}})
        await Chats.findAll({where: {id: req.session.chat}})
        .then(res => {
            res.push({included_id: adminID})
            res.map(val => {
                io.to("user:"+val.included_id).emit("newMessage", { text: 'delete' });
            })
        })
    }
    else {
        const adm = await Chats.findOne({where: [{id: req.session.chat}, {included_id: req.session.userid}]})
        if (adm.is_admin) {
            await Msg.update({type: 3}, {where: {id: req.body.id}})
            await Chats.findAll({where: {id: req.session.chat}})
            .then(res => {
                res.push({included_id: adminID})
                res.map(val => {
                    io.to("user:"+val.included_id).emit("newMessage", { text: 'delete' });
                })
            })
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
    return res.redirect('/login')
})

server.listen(port, "0.0.0.0", () => console.log('----------- Servidor rodando na URL localhost:' + port + ' -----------')) 
