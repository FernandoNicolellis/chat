const DOM = {
    newChatPeople: document.querySelector("#newChatPeople"),
    all: document.querySelector(".all"),
    sugest: document.querySelector('#sugest'),
    okAdd: document.querySelector("#okAdd"),
    ctt: document.querySelector("#ctt"),
    add:  document.querySelector("#add"),
    admAdd: document.querySelector("#admAdd"),
    peopleOnGroup: document.querySelector(".peopleOnGroup"),
    delPpl: document.querySelector("#delPpl")
}
const LINK = 'http://localhost:1111/'
const all = DOM.all.innerHTML.split(',')
all.map((v, i) => all[i] = v.trim())

function autoComplete (each) {
    return all.filter(val => {
        if (each != '') {
            const minAll = val.toLowerCase()
            const minEach = each.toLowerCase()
            return minAll.includes(minEach)
        }
    })
}
function removeChildren(param) {
    param.innerHTML = ''
}
function getURL () {
    var url_string = window.location.href 
    var url = new URL(url_string);
    return url.searchParams.get("o");
}
function deslog () {
    fetch("/deslog", {method: "post"}).then(() => {
        window.location.replace("/login")
    })
}
function maxScroll() {
    var over = document.querySelector(".overflow")
    var maxScroll = over.scrollHeight - over.clientHeight
    return maxScroll == over.scrollTop
}
function nameGroup(name) {
    fetch("/nameGroup", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name
        })
    }).then(res => res.json()).then(res => {
        if (!res.rep) window.location.replace(LINK)  
    })
}

window.addEventListener("load", () => {
    if (getURL() == 'true') {
        document.querySelector("#detail").style.transition = '0s linear'
        document.querySelector("#detail").className += ' show'
        
        setTimeout(() => document.querySelector("#detail").style.transition = 'transform 0.3s ease-in-out', 1);
        window.history.replaceState({}, null, LINK)
    }
 
    document.querySelector('#msg_render').style.marginTop = document.querySelector('.bottom_ceil').offsetHeight + 20 + 'px'
    
    
})

DOM.newChatPeople.addEventListener("keyup", () => {
    DOM.sugest.innerHTML = ''
    if (DOM.newChatPeople.value != '') {
        autoComplete(DOM.newChatPeople.value).map(vs => 
            DOM.sugest.innerHTML += "<div class='choosePerson'  onclick='DOM.newChatPeople.value = this.children[0].innerHTML; removeChildren(DOM.sugest)'> <h5>" + vs + "</h5></div>"
        )
    }   
    else DOM.sugest.innerHTML = ''
})


DOM.okAdd.addEventListener("click", () => {
    if (all.includes(DOM.newChatPeople.value) && DOM.newChatPeople.value != '') {
        fetch("/addChatPeople", {
            method: "post",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                ppl: DOM.newChatPeople.value
            })
        }).then(res => res.json()).then(rep => {
            if (!rep.rep) window.location.replace(LINK+"?o=true")
        })
    }
})

DOM.admAdd.addEventListener('click', () => {
    if (all.includes(DOM.newChatPeople.value) && DOM.newChatPeople.value != '') {
        fetch("/admAdd", {
            method: "post",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                ppl: DOM.newChatPeople.value
            })
        }).then(res => res.json()).then(rep => {
            if (!rep.rep) {
                window.location.replace(LINK + "?o=true")
            }
        })
    }
})

DOM.delPpl.addEventListener('click', () => {
    if (all.includes(DOM.newChatPeople.value) && DOM.newChatPeople.value != '') {
        fetch("/delPpl", {
            method: "post",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                ppl: DOM.newChatPeople.value
            })
        }).then(res => res.json()).then(rep => {
            if (!rep.rep) {
                window.location.replace(LINK + "?o=true")
            }
        })
    }
})

let msgAtual = []

function renderMsg (scroll) {  
    fetch('/render', {
        method: "post"
    }).then(res => res.json()).then(res => {
        if (JSON.stringify(msgAtual) != JSON.stringify(res)) { 
            
            document.querySelector("#msg_render").innerHTML = '' 
            res.map((msg, idx) => {
                
                if (msg.else != undefined) {
                    document.querySelector("#msg_render").innerHTML += msg.else
                }
                else if (msg.msg != undefined){
                    msg = msg.msg
                   
                    let wrapper = document.createElement("div")
                    wrapper.innerHTML = msg.open + msg.close

                    let wrap = wrapper.firstChild
                    wrap.querySelector("span.msg_text").innerText = msg.text

                    
                    document.querySelector("#msg_render").appendChild(wrap)  
                }
            })
            if (scroll) document.querySelector(".overflow").scroll(0, document.querySelector(".overflow").scrollHeight) 
        }
        msgAtual = res
   
    })
}

function changeChat (id, value, children) {

    DOM.ctt.innerHTML = value
    DOM.add.innerHTML = "<h4 style='display: inline-block;'> Adicionar à </h4>" + value

    DOM.peopleOnGroup.innerHTML = ''
    
    let counter_start
    for (let c = 0; c<=children.length-1;c++) {
        if (children[c].getAttribute('is_admin') != null) {
            counter_start = c
            break
        }
    }

    for (let counter = counter_start; counter <= children.length - 1; counter++) {
        let is_admin = children[counter].getAttribute('is_admin')  

        children[counter].style.visibility = 'inherit'; children[counter].style.width = 'inherit';
        children[counter].style.height = 'inherit'; children[counter].style.position = 'inherit';
    
        if (is_admin == 'true') {
            DOM.peopleOnGroup.innerHTML += "<div class='alert-sm alert-secondary' style='padding: 7.5px;' >" + children[counter].outerHTML + "<div style='width: 100%; height: 0; display: flex; justify-content: right;' > <span style='margin-top: -30px;' id='adm"+counter+"'> Administrador </span> </div>" + "</div>" + "<br>"
            let fix = document.querySelector("#adm"+counter)
            fix.style.marginLeft = fix.parentNode.offsetWidth - fix.offsetWidth - 5 + 'px'
        }
        else if (is_admin == 'false') {
            DOM.peopleOnGroup.innerHTML += "<div class='alert-sm alert-secondary' style='padding: 7.5px;' >" + children[counter].outerHTML + " </div> <br>"
        }

        children[counter].style.visibility = 'hidden'; children[counter].style.width = '0px';
        children[counter].style.height = '0px'; children[counter].style.position = 'absolute';
    }

    DOM.peopleOnGroup.innerHTML += "Data de criação: " + document.querySelector("#chatDate" + id).innerHTML

    if (document.querySelector("#this_chat").querySelector("#me")) {

    let me_admin = document.querySelector("#this_chat").querySelector("#me").getAttribute('is_admin')
    if (me_admin == 'true') {
        document.querySelector("#onlyAdm").style.visibility = 'inherit'
        document.querySelector("#onlyAdm").style.width = 'inherit'
        document.querySelector("#onlyAdm").style.height = 'auto'
    }
    else {
        document.querySelector("#onlyAdm").style.visibility = 'hidden'
        document.querySelector("#onlyAdm").style.width = '0'
        document.querySelector("#onlyAdm").style.height = '0' 
    }
}

    document.querySelector("#delMe").style.visibility = 'inherit'
    fetch("/change_chat", {
        method: "post",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            id: id
        })
    }).then(() => renderMsg(true, false))
}

if (document.querySelector("p#reloadP").innerHTML != '' && document.querySelector("p#reloadP").innerHTML != 0) {

    var text = document.getElementById(document.querySelector("p#reloadP").innerHTML).innerHTML 

    DOM.ctt.innerHTML = text
    DOM.add.innerHTML = "<h4 style='display: inline-block;'> Adicionar à </h4>" + text

    let children = document.getElementById(document.querySelector("p#reloadP").innerHTML).children


    DOM.peopleOnGroup.innerHTML = ''

    let counter_start
    for (let c = 0; c<=children.length-1;c++) {
        if (children[c].getAttribute('is_admin') != null) {
            counter_start = c
            break
        }
    }

    for (let counter = counter_start; counter <= children.length - 1; counter++) {
        let is_admin = children[counter].getAttribute('is_admin')  

        children[counter].style.visibility = 'inherit'; children[counter].style.width = 'inherit';
        children[counter].style.height = 'inherit'; children[counter].style.position = 'inherit';
    
        if (is_admin == 'true') {
            DOM.peopleOnGroup.innerHTML += "<div class='alert-sm alert-secondary' style='padding: 7.5px;' >" + children[counter].outerHTML + "<div style='width: 100%; height: 0; display: flex; justify-content: right;' > <span style='margin-top: -30px;' id='adm"+counter+"' > Administrador </span> </div>" + "</div>" + "<br>"
            let fix = document.querySelector("#adm"+counter)
            fix.style.marginLeft = fix.parentNode.offsetWidth - fix.offsetWidth - 5 + 'px'
        }
        else if (is_admin == 'false') {
            DOM.peopleOnGroup.innerHTML += "<div class='alert-sm alert-secondary' style='padding: 7.5px;' >" + children[counter].outerHTML + " </div> <br>"
        }

        children[counter].style.visibility = 'hidden'; children[counter].style.width = '0px';
        children[counter].style.height = '0px'; children[counter].style.position = 'absolute';
    }

    DOM.peopleOnGroup.innerHTML += "Data de criação: " + document.querySelector("#chatDate" + document.querySelector("p#reloadP").innerText).innerHTML


    let me_admin = document.querySelector("#this_chat").querySelector("#me").getAttribute('is_admin')
    if (me_admin == 'true') {
        document.querySelector("#onlyAdm").style.visibility = 'inherit'
        document.querySelector("#onlyAdm").style.width = 'inherit'
        document.querySelector("#onlyAdm").style.height = 'auto'
    }
    else {
        document.querySelector("#onlyAdm").style.visibility = 'hidden'
        document.querySelector("#onlyAdm").style.width = '0'
        document.querySelector("#onlyAdm").style.height = '0'
    }
    document.querySelector("#delMe").style.visibility = 'inherit'
}
if (document.querySelector("p#reloadP").innerHTML == '' || document.querySelector("p#reloadP").innerHTML == 0) {
    document.querySelector("#onlyAdm").style.visibility = 'hidden'
    document.querySelector("#onlyAdm").style.width = '0'
    document.querySelector("#onlyAdm").style.height = '0' 
    document.querySelector("#delMe").style.visibility = 'hidden'
}



let ping = 50
const inputPing = document.querySelector("input#ping")
inputPing.addEventListener('keyup', () => {
    if (inputPing.value >= 5 && inputPing.value<= 100) {
        ping = Number(inputPing.value)
        clearInterval(msgInterval)
        msgInterval = setInterval(() => {
            renderMsg( maxScroll(), false )
        }, ping);
    }
    else ping = 50
})
renderMsg( true )

let msgInterval = setInterval(() => {
    renderMsg( maxScroll(), false )
}, ping);


document.querySelector("#newChat").addEventListener("click", () => {
    fetch("/newChat", {method: "post"}).then(() => {
        window.location.replace(LINK)
    })  
})

document.querySelector("#submit").addEventListener("click", () => {
    fetch("/new_msg", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: document.querySelector("#text").value
        })
    }).then(() => { 
        renderMsg( maxScroll(), false )
        document.querySelector("#text").value = ''
    })
})

document.querySelector("#text").addEventListener('keydown', e => {
    if (e.key == 'Enter') {
        fetch("/new_msg", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: document.querySelector("#text").value
            })
        }).then(() => {
            renderMsg( maxScroll(), false )
            document.querySelector("#text").value = ''
        })
    }
})

document.querySelector("#delMe").addEventListener("click", () => {
    fetch("/delMe", {
        method: "post"
    }).then(res => res.json()).then(rep => {
        if (!rep.rep) {
            window.location.replace(LINK)
        }
    })
})

const file = document.querySelector("#file")
const formFile = document.querySelector("#fileForm")

formFile.addEventListener("submit", e => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('file', file.files[0])

    
    fetch('/fileUpload', {
        method: 'post',
        body: formData   
    })
    
    
})

document.querySelector("#goDown").addEventListener("click", () => {
    document.querySelector(".overflow").scroll(0, document.querySelector(".overflow").scrollHeight) 
})


function msgDel(id) {
    const confirm = window.confirm("Tem certeza que deseja apagar a mensagem? Esta ação é irreversível!")
    if (confirm) {
        fetch("/delMsg", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        })
    }
    
}

