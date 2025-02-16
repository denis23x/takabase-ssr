/** @format */

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { REQUEST, RESPONSE } from './src/app/core/tokens/express.tokens';
import { environment } from './src/environments/environment';
import { unfurl } from 'unfurl.js';
import { Metadata } from 'unfurl.js/dist/types';
import express from 'express';
import bootstrap from './src/main.server';
import expressStaticGzip from 'express-static-gzip';
import compression from 'compression';
import proxy from 'express-http-proxy';

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
	server.use('/sitemaps/*', proxy(environment.apiUrl, {
		filter: (req) => req.method === 'GET',
		proxyReqPathResolver: (req) => {
			return '/api/v1/' + req.originalUrl.replace('.xml', '').substring(1);
		}
	}));

	// API Endpoint for fetching metadata
	server.use('/metadata/*', async (req, res) => {
		await unfurl(req.query.url as string)
			.then((metadata: Metadata) => {
				res.status(200).send({
					data: metadata,
					statusCode: 200
				});
			})
			.catch((error: any) => {
				res.status(500).send({
					error: 'Internal Server Error',
					message: error.info.url,
					statusCode: 500
				});
			});
	});

	// prettier-ignore
	server.use(['/post-covers/*', '/post-images/*', '/post-password-covers/*', '/post-password-images/*', '/post-private-covers/*', '/post-private-images/*', '/user-avatars/*', '/seed/*', '/temp/*'], proxy('https://firebasestorage.googleapis.com', {
		filter: (req) => req.method === 'GET',
		proxyReqPathResolver: (req) => {
			const filename: string = req.originalUrl.split('/').pop();
			const filenameUid: string = filename.split('-').pop();

			const storageBucket: string = ['/v0/b', environment.firebase.storageBucket, 'o'].join('/') + '/';
			const storageBucketFile: string = encodeURIComponent(req.originalUrl.replace(filename, filenameUid).substring(1)) + '?alt=media';

			return storageBucket + storageBucketFile;
		}
	}));

	// prettier-ignore
	server.get(['/search/posts/:postId', '/:username/post/:postId', '/:username/category/:categoryId/post/:postId'], (req, res) => {
		res.set('Cache-Control', 'no-store').redirect(301, '/post/' + req.params.postId);
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
