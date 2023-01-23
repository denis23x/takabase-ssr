/** @format */

import { Injectable } from '@angular/core';
import { HelperService, MarkdownParser } from '../../core';

@Injectable({
	providedIn: 'root'
})
export class MarkdownPluginService {
	constructor(private helperService: HelperService) {}

	getYoutubeParser(url: string): string {
		const regex: RegExp = this.helperService.getRegex('url-youtube');
		const match: RegExpMatchArray | null = url.match(regex);

		if (match) {
			return match[2];
		}

		return '';
	}

	// prettier-ignore
	getYoutubeTemplate(service: string, id: string, url: string, options?: any): string {
		const parameter: number = id.indexOf('?');
		const src: string = 'https://www.youtube.com/embed/';

		return `
      <div class="iframe-youtube">
        <iframe
          src="${src + (parameter > -1 ? id.substr(0, parameter) : id)}"
          frameborder="0"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen="0">
        </iframe>
      </div>
    `;
	}

	getGithubParser(url: string): string {
		const regex: RegExp = this.helperService.getRegex('url-gist');
		const match: RegExpMatchArray | null = url.match(regex);

		if (match) {
			const username = match[2];
			const id = match[3];

			return username + '/' + id;
		}

		return '';
	}

	// prettier-ignore
	getGithubTemplate(service: string, id: string, url: string, options?: any): string {
		const parameter: number = id.indexOf('?');
		const src: string = 'https://gist.github.com/';

    // prettier-ignore
		const randomId: string = id + '-' + Date.now() + Math.floor(Math.random() * Date.now());

		const srcdoc: string = `
      <html lang='en' translate='no'>
        <head>
          <base target='_parent'>
          <title>Gist</title>
        </head>
        <body>
          <script src='${
						src + (parameter > -1 ? id.substr(0, parameter) : id)
					}.js'></script>
        </body>
      </html>
    `;

		const onload: string = `
      (function(){
        /******************/
        /*** ADD STYLES ***/
        /******************/

        const head = this.contentWindow.document.getElementsByTagName('head')[0];
        const style = this.contentWindow.document.createElement('link');

        style.rel = 'stylesheet';
        style.href = 'gist.css';

        head.appendChild(style);

        /******************/
        /*** APPLY THEME ***/
        /******************/

        const parentClassList = window.parent.document.body.classList;
        const parentTheme = parentClassList.value.split(' ').find((className) => ['AUTO', 'LIGHT', 'DARK'].includes(className))

        this.contentWindow.document.body.classList.add(parentTheme);

        /*********************/
        /*** UPDATE LINKS ***/
        /*********************/

        const linkList = this.contentWindow.document.getElementsByTagName('a');

        for (var i = 0; i < linkList.length; i++) {
          linkList[i].setAttribute('target', '_blank');
        }

        /*********************/
        /*** HANDLE HEIGHT ***/
        /*********************/

        const setHeight = window => this.height = window.document.body.scrollHeight;

        const timeout = setTimeout(() => {
          if (this && this.contentWindow) {
            setHeight(this.contentWindow);

            this.contentWindow.addEventListener('resize', () => setHeight(this.contentWindow));
          }

          clearTimeout(timeout);
        }, 200);
      }).call(this)
    `;

		return `
      <div class="github-iframe">
        <iframe
          id="${randomId}"
          onload="${onload}"
          srcdoc="${srcdoc}"
          scrolling="no"
          frameborder="0">
        </iframe>
      </div>
    `;
	}

	embed(md: any, options: any): (state: any, silent: boolean) => boolean {
		return (state: any, silent: boolean): boolean => {
			const theState: any = state;
			const oldPos: number = state.pos;

			const regex: RegExp = /@\[([a-zA-Z].+)]\([\s]*(.*?)[\s]*[)]/im;

			// prettier-ignore
			const match: RegExpMatchArray | null = regex.exec(state.src.slice(state.pos, state.src.length));

			if (!match || match.length < 3) {
				return false;
			}

			const service: string = match[1].toLowerCase();
			const markdownParser: MarkdownParser = {
				['youtube']: this.getYoutubeParser(match[2]),
				['github']: this.getGithubParser(match[2])
			};

			let id: string;

			if (!markdownParser[service]) {
				return false;
			} else {
				id = markdownParser[service];
			}

			const serviceStart: number = oldPos + 2;

			// prettier-ignore
			const serviceEnd: number = md.helpers.parseLinkLabel(state, oldPos + 1, false);

			// We found the end of the link, and know for a fact it's a valid link;
			// so all that's left to do is to call tokenizer.
			if (!silent) {
				theState.pos = serviceStart;
				theState.service = theState.src.slice(serviceStart, serviceEnd);

				// prettier-ignore
				const newState = new theState.md.inline.State(service, theState.md, theState.env, []);

				newState.md.inline.tokenize(newState);

				let token: any;

				token = theState.push('iframe', '');
				token.id = id;
				token.service = service;
				token.url = match[2];
				token.level = theState.level;
			}

			theState.pos += theState.src.indexOf(')', theState.pos);

			return true;
		};
	}

	tokenize(md: any, options: any): (tokens: any, idx: any) => string {
		return (tokens, idx): string => {
			const id: string = md.utils.escapeHtml(tokens[idx].id);

			// prettier-ignore
			const service: string = md.utils.escapeHtml(tokens[idx].service).toLowerCase();

			if (!id.length) {
				return '';
			} else {
				switch (service) {
					case 'youtube':
						// prettier-ignore
						return this.getYoutubeTemplate(service, id, tokens[idx].url, options);
					case 'github':
						// prettier-ignore
						return this.getGithubTemplate(service, id, tokens[idx].url, options);
					default:
						return '';
				}
			}
		};
	}

	insert(md: any, options: any): void {
		const theOptions: any = options;
		const theMd: any = md;

		theMd.renderer.rules.iframe = this.tokenize(theMd, theOptions);

		// prettier-ignore
		theMd.inline.ruler.before('emphasis', 'iframe', this.embed(theMd, theOptions));
	}
}
