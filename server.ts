/** @format */

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import compression from 'compression';
import { REQUEST, RESPONSE } from './src/app/core/tokens/express.tokens';

// Function to get the value of a specific cookie
function getCookie(cookieString: string, cookieName: string) {
	const cookies = cookieString.split('; ');

	for (const cookie of cookies) {
		const [name, value] = cookie.split('=');

		if (name === cookieName) {
			return value;
		}
	}

	return null;
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
	const server = express();
	const serverDistFolder = dirname(fileURLToPath(import.meta.url));
	const browserDistFolder = resolve(serverDistFolder, '../browser');
	const indexHtml = join(serverDistFolder, 'index.server.html');

	const commonEngine = new CommonEngine();

	server.set('view engine', 'html');
	server.set('views', browserDistFolder);

	// Compress all HTTP responses
	server.use(
		compression({
			level: 9,
			filter: (req, res) => {
				if (req.headers['x-no-compression']) {
					return false;
				}

				return compression.filter(req, res);
			}
		})
	);

	// Example Express Rest API endpoints
	// server.get('/api/**', (req, res) => { });

	// Serve static files from /browser
	server.get(
		'*.*',
		express.static(browserDistFolder, {
			maxAge: '1y'
		})
	);

	// All regular routes use the Angular engine
	server.get('*', (req, res, next) => {
		const { protocol, originalUrl, baseUrl, headers } = req;

		let redirectUrl = undefined;

		//! Works only in production build
		if (originalUrl === '/') {
			const cookie = req.headers.cookie;
			const session = getCookie(cookie || '', '__session');

			if (cookie && session) {
				const { pageRedirectHome, userAuthed } = JSON.parse(atob(session));

				if (!!Number(pageRedirectHome) && userAuthed) {
					redirectUrl = '/' + userAuthed;
				}
			}
		}

		commonEngine
			.render({
				bootstrap,
				documentFilePath: indexHtml,
				url: `${protocol}://${headers.host}${redirectUrl || originalUrl}`,
				publicPath: browserDistFolder,
				providers: [
					{
						provide: APP_BASE_HREF,
						useValue: baseUrl
					},
					{
						provide: REQUEST,
						useValue: req
					},
					{
						provide: RESPONSE,
						useValue: res
					}
				]
			})
			.then(html => res.send(html))
			.catch(err => next(err));
	});

	return server;
}

/*
function run(): void {
	const port = process.env['PORT'] || 4000;

	// Start up the Node server
	const server = app();
	server.listen(port, () => {
		console.log(`Node Express server listening on http://localhost:${port}`);
	});
}

run();
*/
