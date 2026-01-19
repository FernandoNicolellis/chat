function w(text) {
    document.currentScript.parentElement.innerHTML = text
}
function $ (query) {
    return document.querySelector(query)
}
function vis(elem) {
    if (typeof(elem) == 'object') return elem.style.visibility = 'hidden'
    else if (typeof(elem) == 'string') return document.querySelector(elem).style.visibility = 'hidden'
}
function invis(elem) {
    if (typeof(elem) == 'object') return elem.style.visibility = 'inherit'
    else if (typeof(elem) == 'string') return document.querySelector(elem).style.visibility = 'inherit'
}
function style(elem) {
    if (typeof(elem) == 'object') return elem.style
    else if (typeof(elem) == 'string') return document.querySelector(elem).style
}
function color(elem, color) {
    if (typeof(elem) == 'object') return elem.style.background = color
    else if (typeof(elem) == 'string') return document.querySelector(elem).style.background = color
}

