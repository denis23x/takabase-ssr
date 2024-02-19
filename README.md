# Takabase SSR

Setup

- `npm install`
- Setup **Prettier**
- Setup **ESLint**

Processes

> Don't use this use docker instead

- `start:dev` local dev server http://localhost:4200
- `start:network` local dev server with access through single network
- `start:deploy` deploy

Builds

- `build:prod` build production SSR bundle
- `build:sprite` build SVG sprite and inject it into **index.html**
- `build:sitemap` build **sitemap.xml** based on https://takabase.com

Makefile (using Docker)

- `make build` build docker image
- `make up` run docker container with local dev server http://localhost:4200
- `make down` stop docker container

Some configurations

- `src/environments` app .env
- `angular.json` app config
- `ecosystem.config.js` process handler (production docker)
- `firebase.json` dev deploy config
- `ngsw-config.json` PWA config

Contact https://t.me/denis23x
