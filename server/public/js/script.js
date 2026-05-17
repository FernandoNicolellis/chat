const DOM = {
    newChatPeople: document.querySelector("#newChatPeople"),
    all: document.querySelector(".all"),
    sugest: document.querySelector('#sugest'),
    okAdd: document.querySelector("#okAdd"),
    ctt: document.querySelector("#ctt"),
    add:  document.querySelector("#add"),
    admAdd: document.querySelector("#admAdd"),
    peopleOnGroup: document.querySelector(".peopleOnGroup"),
    delPpl: document.querySelector("#delPpl"),
    searchChats: document.querySelector("#searchChats")
}
const socket = io();


let iconCounter = 0

function setAppIcon(num) {
    try {
        window.appIcon?.set(Number(num))
    } catch (_err) {}
}


let windowFocused = document.hasFocus();
if (window.windowFocus && typeof window.windowFocus.onChange === "function") {
    window.windowFocus.onChange((focused) => {
        windowFocused = focused;
        if (focused) {
            iconCounter = 0
            setAppIcon(iconCounter)
        }
            
    });
}


// Defensive guards: ensure DOM elements exist before using them
for (const k in DOM) {
    if (!DOM[k]) DOM[k] = null
}
const LINK = 'http://localhost:1111/'

let all = []
if (DOM.all && DOM.all.innerHTML) {
    all = DOM.all.innerHTML.split(',').map(v => v.trim())
}


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
function createUnreadDivider(positionFromBottom) {
    const container = document.querySelector("#msg_render")
    if (!container) return

    const pos = Number(positionFromBottom)
    if (!Number.isFinite(pos) || pos <= 0) return

    const existing = container.querySelector(".unread-divider")
    if (existing) existing.remove()

    const wrapper = document.createElement("div")
    wrapper.className = "unread-divider"
    wrapper.style.cssText = "width:100%; display:flex; align-items:center; justify-content:center; margin:8px 0; background:#d9d9d9; color:#2b2b2b; font-weight:700; padding:2px 8px; font-size:15px;"

    const text = document.createElement("span")
    text.innerText = "Mensagens não lidas"
    wrapper.appendChild(text)

    const messageEls = Array.from(container.children).filter(el =>
        el.matches(".msg_1, .msg_2, .img1, .img2")
    )
    if (messageEls.length === 0) return

    const indexFromTop = messageEls.length - pos
    const target = messageEls[Math.max(0, indexFromTop)]
    container.insertBefore(wrapper, target)
}
function getURL () {
    var url_string = window.location.href 
    var url = new URL(url_string);
    return url.searchParams.get("o");
}
function getParam (key) {
    var url_string = window.location.href
    var url = new URL(url_string)
    return url.searchParams.get(key)
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
        if (!res.rep) setTimeout(() => window.location.replace(LINK), 200);
    })
}


fetch("/me")
  .then(r => r.json())
  .then(data => {
    socket.emit("registerUser", data.userId);
});

let currentChat = undefined;

window.addEventListener("load", () => {
    if (getURL() == 'true') {
        document.querySelector("#detail").style.transition = '0s linear'
        document.querySelector("#detail").className += ' show'
        
        setTimeout(() => document.querySelector("#detail").style.transition = 'transform 0.3s ease-in-out', 1);
        window.history.replaceState({}, null, LINK)
    }

    if (getParam("openChats") == 'true') {
        const chats = document.querySelector("#chats")
        if (chats) {
            chats.style.transition = '0s linear'
            chats.className += ' show'
            setTimeout(() => chats.style.transition = 'transform 0.3s ease-in-out', 1);
        }
        window.history.replaceState({}, null, LINK)
    }
 
    document.querySelector('#msg_render').style.marginTop = document.querySelector('.bottom_ceil').offsetHeight + 20 + 'px'
    
    
})

function createReloadChatsButton() {
    const header = document.querySelector("#chats .offcanvas-header")
    if (!header) return
    if (header.querySelector("#reloadChats")) return
    header.style.display = "flex"
    header.style.alignItems = "center"
    header.style.justifyContent = "flex-start"

    const btn = document.createElement("button")
    btn.type = "button"
    btn.id = "reloadChats"
    btn.className = "btn"
    btn.setAttribute("aria-label", "Reload chats")
    btn.title = "Atualizações pendentes"
    btn.style.marginLeft = "4px"
    btn.style.background = "transparent"
    btn.style.border = "0"
    btn.style.padding = "4px"
    btn.style.cursor = "pointer"

    const img = document.createElement("img")
    img.src = "/img/reloadPage.png"
    img.alt = "Reload"
    img.style.width = "26px"
    img.style.height = "26px"
    img.style.transform = "rotate(90deg)"
    btn.appendChild(img)

    btn.addEventListener("click", () => {
        window.location.replace(LINK + "?openChats=true")
    })

    const title = header.querySelector("#chatsLabel")
    if (title) {
        title.style.marginRight = "4px"
        title.insertAdjacentElement("afterend", btn)
    } else {
        const closeBtn = header.querySelector(".btn-close")
        if (closeBtn) header.insertBefore(btn, closeBtn)
        else header.appendChild(btn)
    }
    const closeBtn = header.querySelector(".btn-close")
    if (closeBtn) closeBtn.style.marginLeft = "auto"
}

if (DOM.searchChats) {
    DOM.searchChats.addEventListener("keyup", () => {
        const term = DOM.searchChats.value.trim().toLowerCase()

        document.querySelectorAll("div.changeChat").forEach(child => {
            const visibleTitle = Array.from(child.querySelectorAll("h4"))
                .filter(el => getComputedStyle(el).visibility !== "hidden" && getComputedStyle(el).display !== "none")
                .map(el => el.textContent.trim())
                .join(" ")
                .toLowerCase()

            const shouldShow = term === '' || visibleTitle.includes(term)
            child.style.display = shouldShow ? "" : "none"

            // Each chat entry is followed by two <br> tags in the template.
            // Hide them together with the chat so remaining entries move up.
            let sibling = child.nextElementSibling
            while (sibling) {
                if (sibling.tagName === "BR") {
                    sibling.style.display = shouldShow ? "" : "none"
                } else if (sibling.classList && sibling.classList.contains("changeChat")) {
                    break
                }
                sibling = sibling.nextElementSibling
            }
        })
    })
}

if (DOM.newChatPeople && DOM.sugest) {
    DOM.newChatPeople.addEventListener("keyup", () => {
        DOM.sugest.innerHTML = ''
        if (DOM.newChatPeople.value != '') {
            autoComplete(DOM.newChatPeople.value).map(vs => 
                DOM.sugest.innerHTML += "<div class='choosePerson'  onclick='DOM.newChatPeople.value = this.children[0].innerHTML; removeChildren(DOM.sugest)'> <h5>" + vs + "</h5></div>"
            )
        }   
        else DOM.sugest.innerHTML = ''
    })
}


if (DOM.okAdd) {
    DOM.okAdd.addEventListener("click", () => {
        if (DOM.newChatPeople && all.includes(DOM.newChatPeople.value) && DOM.newChatPeople.value != '') {
            fetch("/addChatPeople", {
                method: "post",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({ ppl: DOM.newChatPeople.value })
            }).then(res => res.json()).then(rep => {
                if (!rep.rep) setTimeout(() => window.location.replace(LINK+"?o=true"), 50);
            })
        }
    })
}

if (DOM.admAdd) {
    DOM.admAdd.addEventListener('click', () => {
        if (DOM.newChatPeople && all.includes(DOM.newChatPeople.value) && DOM.newChatPeople.value != '') {
            fetch("/admAdd", {
                method: "post",
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify({ ppl: DOM.newChatPeople.value })
            }).then(res => res.json()).then(rep => {
                if (!rep.rep) window.location.replace(LINK + "?o=true")
            })
        }
    })
}

if (DOM.delPpl) {
    DOM.delPpl.addEventListener('click', () => {
        if (DOM.newChatPeople && all.includes(DOM.newChatPeople.value) && DOM.newChatPeople.value != '') {
            fetch("/delPpl", {
                method: "post",
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify({ ppl: DOM.newChatPeople.value })
            }).then(res => res.json()).then(rep => {
                if (!rep.rep) window.location.replace(LINK + "?o=true")
            })
        }
    })
}

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
            
        }
        msgAtual = res
   
    }).then(() => {

        if (scroll) document.querySelector(".overflow").scroll(0, document.querySelector(".overflow").scrollHeight) 
        setTimeout(() => { 
            if (amountOfPendingMessages != 0) {
                createUnreadDivider(amountOfPendingMessages)
                amountOfPendingMessages = 0
            }   
            if (scroll) {
                const container = document.querySelector(".overflow")
                const divider = document.querySelector(".unread-divider")
                let distance = 0

                if (container && divider) { 
                    distance = container.scrollHeight - (divider.offsetTop + divider.offsetHeight) 
                    document.querySelector(".overflow").scroll(0, document.querySelector(".overflow").scrollHeight - distance - 100)
                }
                else
                    document.querySelector(".overflow").scroll(0, document.querySelector(".overflow").scrollHeight)        
            }
                
        }, 20)     
    })   
}

function moveChatToTop(chatId) {
    const chatBox = document.getElementById(String(chatId))
    if (!chatBox) return
    const list = document.querySelector("#chats .offcanvas-body")
    if (!list) return

    const firstChat = list.querySelector("div.btn.btn-secondary[id]")
    if (!firstChat || firstChat === chatBox) return

    const trailing = []
    let node = chatBox.nextSibling
    while (node) {
        if (node.nodeType === 1 && node.matches("div.btn.btn-secondary[id]")) break
        trailing.push(node)
        node = node.nextSibling
    }

    list.insertBefore(chatBox, firstChat)
    for (const n of trailing) {
        list.insertBefore(n, firstChat)
    }
}

function setChatPendingBadge(chatId) {
    const badge = document.querySelector("#pending" + chatId)
    if (!badge) return
    const current = Number(badge.innerText) || 0
    badge.innerText = String(current + 1)
    badge.style.visibility = "visible"
}
let amountOfPendingMessages = 0

renderMsg( true )
socket.on("newMessage", (data) => {

    renderMsg( true ) 
    moveChatToTop(data.chatId)

    if (!windowFocused) {
        iconCounter++
        setAppIcon(Number(iconCounter))
    }

    if (data.text == 'delete') return
    if (data.chatId == currentChat && windowFocused) return
    if (data.chatId != currentChat) setChatPendingBadge(data.chatId)    
    
    

    try {
        if (data.text == undefined) data.text = ' enviou um arquivo'
        else data.text = ": " + data.text
        window.electronNotify({
            title: data.chatName,
            body: data.sender_name + data.text
        });
    } catch (err) {
        //console.log("Electron notification not available:", err);
    } 
});
socket.on("reloadCanvas", () => {
    createReloadChatsButton()
})

function changeChat (id, value, children) {

    for (let c = 0; c<=children.length-1;c++) {
        if ((children[c].id && children[c].id.startsWith("pending"))) {
            amountOfPendingMessages = children[c].innerText
        }
    }

    DOM.ctt.innerHTML = value
    DOM.ctt.querySelectorAll("[id^='pending'], .pending-badge").forEach(el => el.remove())
    DOM.add.innerHTML = "<h4 style='display: inline-block;'> Adicionar à </h4>" + value
    DOM.add.querySelectorAll("[id^='pending'], .pending-badge").forEach(el => el.remove())
    const pendingEl = document.querySelector("#pending" + id)
    if (pendingEl) {
        pendingEl.innerText = "0"
        pendingEl.style.visibility = "hidden"
    }

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
        if ((children[counter].id && children[counter].id.startsWith("pending")) || children[counter].classList.contains("pending-badge")) {
            
            continue
        }

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
    }).then((chat) => {
        renderMsg(true)
        chat.json().then(chat => {
            currentChat = chat.chat;
        })
        if (document.getElementById(String(id)).style.backgroundColor == 'rgb(108, 117, 125)') {
            document.querySelector("#delMe").style.visibility = 'hidden'
        }
    })

}

if (document.querySelector("p#reloadP").innerHTML != '' && document.querySelector("p#reloadP").innerHTML != 0) {

    currentChat = document.querySelector("p#reloadP").innerHTML

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
        if ((children[counter].id && children[counter].id.startsWith("pending")) || children[counter].classList.contains("pending-badge")) {
            continue
        }

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


    const meEl = document.querySelector("#this_chat")?.querySelector("#me")
    if (meEl) {
        let me_admin = meEl.getAttribute('is_admin')
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
    } else {
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





document.querySelector("#newChat").addEventListener("click", () => {
    fetch("/newChat", {method: "post"}).then(() => {
        setTimeout(() => { window.location.replace(LINK) }, 200)
        
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
        document.querySelector("#text").value = ''
    })
})

document.querySelector("#text").addEventListener('keydown', e => {
    if (e.key == 'Enter' && !e.shiftKey) {
        fetch("/new_msg", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: document.querySelector("#text").value
            })
        }).then(() => {
            document.querySelector("#text").value = ''
        })
    }
})

document.querySelector("#delMe").addEventListener("click", () => {
    fetch("/delMe", {
        method: "post"
    }).then(res => res.json()).then(rep => {
        if (!rep.rep) setTimeout(() => window.location.replace(LINK), 200)
        
    })
})

const file = document.querySelector("#file")
const formFile = document.querySelector("#fileForm")

formFile?.addEventListener("submit", e => {
    e.preventDefault()

    if (!file?.files?.length) return
    
    const formData = new FormData()
    formData.append('file', file.files[0])

    fetch('/fileUpload', {
        method: 'post',
        body: formData   
    }).then(res => {
        if (!res.ok) throw new Error("File upload failed")
        file.value = ''
        renderMsg(true)
    }).catch(err => {
        console.error(err)
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
        }).then(() => {
            renderMsg(true)
        })
    }
    
}
