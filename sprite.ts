/** @format */

import prompts from 'prompts';
import fs from 'node:fs';
import jsdom from 'jsdom';
import { spawn, ChildProcess } from 'child_process';

(async () => {
	const sprite: prompts.Answers<string> = await prompts({
		type: 'select',
		name: 'sprite',
		message: 'Select a sprite',
		choices: [
			{
				title: 'Bootstrap',
				value: 'bootstrap',
				description: 'Build sprite of Bootstrap icons'
			},
			{
				title: 'Logo',
				value: 'logo',
				description: 'Build sprite of logos'
			}
		],
		initial: 0
	});

	const insertDataSpriteToIndex = (path: string, selector: string) => {
		fs.readFile(path, 'utf8', (error: NodeJS.ErrnoException, sprite: string) => {
			if (error) {
				throw error;
			}

			jsdom.JSDOM.fromFile('src/index.html').then((dom: jsdom.JSDOM) => {
				dom.window.document.querySelector(selector).innerHTML = sprite;

				const html: string = dom.serialize().replace('<!-- @format -->', '');

				fs.writeFile('src/index.html', html, (error: NodeJS.ErrnoException) => {
					if (error) {
						throw error;
					}
				});
			});
		});
	};

	if (sprite.sprite) {
		const command: string[] = [];

		// prettier-ignore
		if (sprite.sprite === 'bootstrap') {
			command.unshift('svg2sprite ./src/assets/icons/bootstrap ./src/assets/icons/sprite-bootstrap.svg --inline --stripAttrs class --stripAttrs fill');
		}

		if (sprite.sprite === 'logo') {
			command.unshift('svg2sprite ./src/assets/icons/logo ./src/assets/icons/sprite-logo.svg --inline');
		}

		/** RUN */

		const run: ChildProcess = spawn(command.join(' && '), {
			shell: true,
			stdio: 'inherit'
		});

		/** CLOSE */

		run.on('close', () => {
			if (sprite.sprite === 'bootstrap') {
				insertDataSpriteToIndex('src/assets/icons/sprite-bootstrap.svg', "[data-sprite='bootstrap']");
			}

			if (sprite.sprite === 'logo') {
				insertDataSpriteToIndex('src/assets/icons/sprite-logo.svg', "[data-sprite='logo']");
			}

			/** Prettier */

			spawn('prettier --write src/index.html --log-level silent', {
				shell: true,
				stdio: 'inherit'
			});
		});
	} else {
		console.log('Ok, Bye!');
	}
})();
