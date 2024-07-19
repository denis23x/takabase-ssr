/** @format */

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { REQUEST, RESPONSE } from './src/app/core/tokens/express.tokens';
import express from 'express';
import bootstrap from './src/main.server';
import expressStaticGzip from 'express-static-gzip';
import compression from 'compression';

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

	server.use(compression());

	server.set('view engine', 'html');
	server.set('views', browserDistFolder);

	// prettier-ignore
	server.get(['/search/posts/:postId', '/:username/post/:postId', '/:username/category/:categoryId/post/:postId'], (req, res) => {
		res.status(301).redirect('/post/' + req.params.postId);
	});

	// prettier-ignore
	server.get('*.*', expressStaticGzip(browserDistFolder, {
		enableBrotli: true,
		serveStatic: {
			maxAge: '1y'
		}
	}));

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
				inlineCriticalCss: true,
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

function run(): void {
	const port = process.env['PORT'] || 4000;

	// Start up the Node server
	const server = app();
	server.listen(port, () => {
		console.log(`Node Express server listening on http://localhost:${port}`);
	});
}

run();
