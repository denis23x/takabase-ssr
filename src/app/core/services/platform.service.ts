/** @format */

import { Inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, EMPTY, fromEvent, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { User, UserSettingsTheme } from '../models';

/**
 * Window provider is based on
 * https://juristr.com/blog/2016/09/ng2-get-window-ref/
 */

const getWindow = (): Window => window;

@Injectable()
export class PlatformService {
  private readonly renderer2: Renderer2;

  overlayUUIDList: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

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

  isMobile(): boolean {
    if (this.isBrowser()) {
      const window: Window = this.getWindow();

      return ((agent: string) => {
        // prettier-ignore
        const a: RegExp = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;

        // prettier-ignore
        const b: RegExp = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;

        return a.test(agent) || b.test(agent.substr(0, 4));
      })(window.navigator.userAgent || window.navigator.vendor || window['opera']);
    }

    return false;
  }

  getBrowserAgent(): string | undefined {
    /**
     * Browser detection is based on
     * https://stackblitz.com/edit/browser-detection?file=index.js
     */

    const browserList: string[][] = [
      ['firefox', 'Firefox'],
      ['opera', 'Opera'],
      ['ie', 'Trident'],
      ['edge', 'Edg'],
      ['brave', 'Brave'],
      ['chrome', 'Chrome'],
      ['safari', 'Safari']
    ];

    if (this.isBrowser()) {
      const window: Window = this.getWindow();

      for (const [browser, agent] of browserList) {
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
      const window: Window = this.getWindow();

      return fromEvent(window, 'scroll').pipe(debounceTime(debounce));
    }

    return EMPTY;
  }

  getResize(debounce: number = 200): Observable<Event> {
    if (this.isBrowser()) {
      const window: Window = this.getWindow();

      return fromEvent(window, 'resize').pipe(debounceTime(debounce));
    }

    return EMPTY;
  }

  setScrollToggle(toggle: boolean): void {
    if (this.isBrowser()) {
      const window: Window = this.getWindow();
      const className: string = 'overlay';

      if (this.document.body.clientHeight > window.innerHeight) {
        this.renderer2[toggle ? 'addClass' : 'removeClass'](this.document.body, className);
      } else {
        this.renderer2.removeClass(this.document.body, className);
      }
    }
  }

  setSettings(user: User): void {
    if (this.isBrowser()) {
      this.document.body.classList.remove(...Object.values(UserSettingsTheme));
      this.document.body.classList.add(user.settings.theme);
    }
  }

  removeSettings(user: User): void {
    if (this.isBrowser()) {
      // this.document.body.classList.remove(user.settings?.theme);
    }
  }
}
