/** @format */

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
	const server = express();
	const serverDistFolder = dirname(fileURLToPath(import.meta.url));
	const browserDistFolder = resolve(serverDistFolder, '../browser');
	const indexHtml = join(serverDistFolder, 'index.server.html');

	const commonEngine = new CommonEngine();

	server.set('view engine', 'html');
	server.set('views', browserDistFolder);

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

		commonEngine
			.render({
				bootstrap,
				documentFilePath: indexHtml,
				url: `${protocol}://${headers.host}${originalUrl}`,
				publicPath: browserDistFolder,
				providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }]
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

// /** @format */
//
// import 'zone.js/dist/zone-node';
//
// import { ngExpressEngine } from '@nguniversal/express-engine';
// import * as express from 'express';
// import { join } from 'path';
//
// import { AppModule } from './src/main';
// import { APP_BASE_HREF } from '@angular/common';
// import { existsSync } from 'fs';
// import * as compression from 'compression';
//
// // The Express app is exported so that it can be used by serverless Functions.
// export function app(): express.Express {
// 	const server = express();
// 	const distFolder = join(process.cwd(), 'dist/draft-ssr/browser');
// 	const indexHtml = existsSync(join(distFolder, 'index.original.html'))
// 		? 'index.original.html'
// 		: 'index';
//
// 	// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
// 	server.engine(
// 		'html',
// 		ngExpressEngine({
// 			bootstrap: AppServerModule
// 		})
// 	);
//
// 	server.set('view engine', 'html');
// 	server.set('views', distFolder);
//
// 	const shouldCompress = (req: any, res: any) => {
// 		if (req.headers['x-no-compression']) {
// 			// Will not compress responses, if this header is present
// 			return false;
// 		}
// 		// Resort to standard compression
// 		return compression.filter(req, res);
// 	};
//
// 	// Compress all HTTP responses
// 	server.use(
// 		compression({
// 			level: 9,
// 			// filter: Decide if the answer should be compressed or not,
// 			// depending on the 'shouldCompress' function above
// 			filter: shouldCompress
// 		})
// 	);
//
// 	// Example Express Rest API endpoints
// 	// server.get('/api/**', (req, res) => { });
//
// 	// Serve static files from /browser
// 	server.get(
// 		'*.*',
// 		express.static(distFolder, {
// 			maxAge: '1y'
// 		})
// 	);
//
// 	// All regular routes use the Universal engine
// 	server.get('*', (req, res) => {
// 		// Send file loader if restricted
//
// 		/** Disabled SSG for a while */
//
// 		// const loaderPath = ['/confirmation', '/create', '/update', '/settings'];
// 		//
// 		// if (loaderPath.find(path => req.originalUrl.startsWith(path))) {
// 		// 	return res.sendFile(join(distFolder, 'loader', 'index.html'));
// 		// }
// 		//
// 		// // Send file if full match
// 		//
// 		// const fullPath = join(distFolder, req.originalUrl);
// 		//
// 		// if (existsSync(fullPath)) {
// 		// 	return res.sendFile(join(fullPath, 'index.html'));
// 		// }
//
// 		res.render(indexHtml, {
// 			req,
// 			providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }]
// 		});
// 	});
//
// 	return server;
// }
//
// function run(): void {
// 	const port = process.env.PORT || 4000;
//
// 	// Start up the Node server
// 	const server = app();
//
// 	server.listen(port, () => {
// 		console.log(`Node Express server listening on http://localhost:${port}`);
// 	});
// }
//
// // Webpack will replace 'require' with '__webpack_require__'
// // '__non_webpack_require__' is a proxy to Node 'require'
// // The below code is to ensure that the server is run only when not requiring the bundle.
// declare const __non_webpack_require__: NodeRequire;
// const mainModule = __non_webpack_require__.main;
// const moduleFilename = (mainModule && mainModule.filename) || '';
// if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
// 	run();
// }
//
// export * from './src/main.server';
