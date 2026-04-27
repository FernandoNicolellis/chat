const $ = {
    q: (query) => {
        return document.querySelector(query)
    },

    cut: (query) => {
        return document.querySelector(query).style.visibility = "hidden"
    },

    put: (query) => {
        return document.querySelector(query).style.visibility = "inherit"
    },
    
    text: (query, text) => {
        return document.querySelector(query).innerHTML = text
    },

    style: (query) => {
        return document.querySelector(query).style
    },

    color: (query, color) => {
        return document.querySelector(query).style.backgroundColor = color
    },

    click: (query, exec) => {
        document.querySelector(query).addEventListener("click", (values) => {
            exec(values)
        })
    },

    div: (query) => {
        var div = document.createElement("div")
        div.style.width = '250px'
        div.style.height = '250px'
        div.style.backgroundColor = 'gray'
        div.id = query
        document.querySelector("body").appendChild(div)
    }


}
