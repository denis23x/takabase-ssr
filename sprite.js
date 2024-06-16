const prompts = require('prompts');
const spawn = require('child_process').spawn;
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

(async () => {
  const sprite = await prompts({
    type: 'select',
    name: 'sprite',
    message: 'Select a sprite',
    choices: [
      {
        title: 'Bootstrap',
        value: 'bootstrap',
        description: 'Build sprite of Bootstrap icons',
      },
      {
        title: 'Logo',
        value: 'logo',
        description: 'Build sprite of logos',
      }
    ],
    initial: 0
  });

  const insertDataSpriteToIndex = (path, selector) => {
    fs.readFile(path, "utf8", (err, sprite) => {
      if (err) {
        throw err;
      }

      JSDOM.fromFile("src/index.html").then((dom) => {
        dom.window.document.querySelector(selector).innerHTML = sprite;

        const html = dom.serialize().replace("<!-- @format -->", "");

        fs.writeFile("src/index.html", html, (err) => {
          if (err) {
            throw err;
          }
        })
      })
    })
  }

  if (sprite.sprite) {
    const command = [];

    if (sprite.sprite === 'bootstrap') {
      command.unshift('svg2sprite ./src/assets/icons/bootstrap ./src/assets/icons/sprite-bootstrap.svg --inline --stripAttrs class --stripAttrs fill');
    }

    if (sprite.sprite === 'logo') {
      command.unshift('svg2sprite ./src/assets/icons/logo ./src/assets/icons/sprite-logo.svg --inline');
    }

    /** RUN */

    const run = spawn(command.join(' && '), {
      shell: true,
      stdio:'inherit'
    });

    /** CLOSE */

    run.on("close", () => {
      if (sprite.sprite === 'bootstrap') {
        insertDataSpriteToIndex("src/assets/icons/sprite-bootstrap.svg", "[data-sprite='bootstrap']");
      }

      if (sprite.sprite === 'logo') {
        insertDataSpriteToIndex("src/assets/icons/sprite-logo.svg", "[data-sprite='logo']");
      }

      /** Prettier */

      spawn('prettier --write src/index.html --log-level silent', {
        shell: true,
        stdio:'inherit'
      });
    });
  } else {
    console.log('Ok, Bye!');
  }
})();
