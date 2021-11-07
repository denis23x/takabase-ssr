/** @format */

import { Injectable } from '@angular/core';
import { HelperService, LocalStorageService, PlatformService } from '../../../core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarkdownPluginService {
  constructor(
    private helperService: HelperService,
    private platformService: PlatformService,
    private localStorageService: LocalStorageService
  ) {}

  getYoutubeParser(url: string): string {
    const regex = this.helperService.getRegex('url-youtube');
    const match = url.match(regex);

    if (match) {
      return match[2];
    }

    return '';
  }

  getYoutubeTemplate(service: string, id: string, url: string, options: any): string {
    const parameter = id.indexOf('?');
    const src = 'https://www.youtube.com/embed/';

    return `
      <div class="youtube-iframe">
        <iframe
          src="${src + (parameter > -1 ? id.substr(0, parameter) : id)}"
          frameborder="0"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
  }

  getGithubParser(url: string): string {
    const regex = this.helperService.getRegex('url-gist');
    const match = url.match(regex);

    if (match) {
      const username = match[2];
      const id = match[3];

      return username + '/' + id;
    }

    return '';
  }

  getGithubTemplate(service: string, id: string, url: string, options: any): string {
    const parameter = id.indexOf('?');
    const src = 'https://gist.github.com/';
    const config = this.localStorageService.getItem(environment.CONFIG_LOCALSTORAGE);

    let colorTheme = 'auto';

    if (config) {
      colorTheme = JSON.parse(config).colorTheme;
    }

    const srcdoc = `
      <html lang='en' translate='no'>
        <head>
          <base target='_parent'>
          <title>Gist</title>
        </head>
        <body class='${colorTheme}'>
          <script src='${src + (parameter > -1 ? id.substr(0, parameter) : id)}.js'></script>
        </body>
      </html>
    `;

    const isChrome = this.platformService.getBrowserAgent() === 'chrome';
    const isDesktop = !this.platformService.isMobile();

    const scrollbarFix = isChrome && isDesktop ? 6 : 0;

    const onload = `
      (function(){
        const iframe = document.getElementById(id);
        const head = iframe.contentWindow.document.getElementsByTagName('head')[0];
        const style = iframe.contentWindow.document.createElement('link');

        style.rel = 'stylesheet';
        style.href = 'gist.css';

        head.appendChild(style);

        setTimeout(() => {
          if (iframe) {
            iframe.height = 0;
            iframe.height = iframe.contentWindow.document.body.scrollHeight - ${scrollbarFix};
          }
        });
      }).call(this)
    `;

    return `
      <div class="github-iframe">
        <iframe
          id="${id}-${Date.now()}"
          onload="${onload}"
          srcdoc="${srcdoc}"
          scrolling="no"
          frameborder="0">
        </iframe>
      </div>
    `;
  }

  embed(md: any, options: any): (state: any, silent: any) => boolean {
    return (state, silent): boolean => {
      const theState = state;
      const oldPos = state.pos;

      const regex = /@\[([a-zA-Z].+)]\([\s]*(.*?)[\s]*[)]/im;
      const match = regex.exec(state.src.slice(state.pos, state.src.length));

      if (!match || match.length < 3) {
        return false;
      }

      const service = match[1].toLowerCase();
      const parser: any = {
        ['youtube']: this.getYoutubeParser(match[2]),
        ['github']: this.getGithubParser(match[2])
      };

      let id: string;

      if (!parser[service]) {
        return false;
      } else {
        id = parser[service];
      }

      const serviceStart: number = oldPos + 2;
      const serviceEnd: number = md.helpers.parseLinkLabel(state, oldPos + 1, false);

      // We found the end of the link, and know for a fact it's a valid link;
      // so all that's left to do is to call tokenizer.
      if (!silent) {
        theState.pos = serviceStart;
        theState.service = theState.src.slice(serviceStart, serviceEnd);

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
      const id = md.utils.escapeHtml(tokens[idx].id);
      const service = md.utils.escapeHtml(tokens[idx].service).toLowerCase();

      if (!id) {
        return '';
      } else {
        switch (service) {
          case 'youtube':
            return this.getYoutubeTemplate(service, id, tokens[idx].url, options);
          case 'github':
            return this.getGithubTemplate(service, id, tokens[idx].url, options);
          default:
            return '';
        }
      }
    };
  }

  insert(md: any, options: any): void {
    const theOptions = options;
    const theMd = md;

    theMd.renderer.rules.iframe = this.tokenize(theMd, theOptions);
    theMd.inline.ruler.before('emphasis', 'iframe', this.embed(theMd, theOptions));
  }
}
