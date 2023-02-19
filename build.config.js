const fs = require("fs")
const tsImport = require("ts-import")

// const grammars = "./src/assets/grammars"
//
// fs.readdir(grammars, (err, files) => {
//   files.forEach((file) => {
//     console.log(file)
//   })
// })

/** --- */

// const backgrounds = "./src/assets/backgrounds"
//
// fs.readdir(backgrounds, (err, files) => {
//   files.forEach((file) => {
//     console.log(file)
//   })
// })

const main = async () => {
  const environment = await tsImport
    .load("./src/environments/environment.ts")
    .then((response) => JSON.parse(JSON.stringify(response)))

  console.log(environment.environment)
}

void main()

//
// fs.readFile("./src/environments/environment.ts", "utf8", (err, data) => {
//   if (err) {
//     console.error(err)
//     return
//   }
//
//   console.log(data)
// })
