/** @format */

import { Inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Window provider is based on
 * https://juristr.com/blog/2016/09/ng2-get-window-ref/
 */

const getWindow = (): Window => window;

@Injectable()
export class PlatformService {
  private readonly renderer2: Renderer2;

  constructor(
    @Inject(PLATFORM_ID)
    private platformId: string,
    @Inject(DOCUMENT)
    private document: Document,
    private rendererFactory2: RendererFactory2
  ) {
    this.renderer2 = rendererFactory2.createRenderer(null, null);
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getBrowserAgent(): string | undefined {
    /**
     * Browser detection is based on
     * https://stackblitz.com/edit/browser-detection?file=index.js
     */

    const browserList = [
      ['firefox', 'Firefox'],
      ['opera', 'Opera'],
      ['ie', 'Trident'],
      ['edge', 'Edg'],
      ['brave', 'Brave'],
      ['chrome', 'Chrome'],
      ['safari', 'Safari']
    ];

    if (this.isBrowser()) {
      const window = this.getWindow();

      for (const [browser, agent] of browserList) {
        // @ts-ignore
        if (window.navigator['brave']) {
          return 'brave';
        }

        if (window.navigator.userAgent.includes(agent)) {
          return browser;
        }
      }

      return undefined;
    }

    return undefined;
  }

  getWindow(): Window {
    return getWindow();
  }

  getScroll(debounce: number = 200): Observable<Event> {
    if (this.isBrowser()) {
      const window = this.getWindow();

      return fromEvent(window, 'scroll').pipe(debounceTime(debounce));
    }

    return EMPTY;
  }

  getResize(debounce: number = 200): Observable<Event> {
    if (this.isBrowser()) {
      const window = this.getWindow();

      return fromEvent(window, 'resize').pipe(debounceTime(debounce));
    }

    return EMPTY;
  }

  setScrollToggle(toggle: boolean): void {
    if (this.isBrowser()) {
      const window = this.getWindow();
      const className = 'overlay';

      if (this.document.body.clientHeight > window.innerHeight) {
        this.renderer2[toggle ? 'addClass' : 'removeClass'](this.document.body, className);
      } else {
        this.renderer2.removeClass(this.document.body, className);
      }
    }
  }
}
