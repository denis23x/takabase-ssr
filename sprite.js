const fs = require("fs")
const jsdom = require("jsdom")
const { JSDOM } = jsdom

fs.readFile("src/assets/icons/sprite.svg", "utf8", (err, sprite) => {
  if (err) {
    throw err
  }

  JSDOM.fromFile("src/index.html").then((dom) => {
    dom.window.document.querySelector("[data-sprite]").innerHTML = sprite

    const html = dom.serialize().replace("<!-- @format -->", "")

    fs.writeFile("src/index.html", html, (err) => {
      if (err) {
        throw err
      }
    })
  })
})
