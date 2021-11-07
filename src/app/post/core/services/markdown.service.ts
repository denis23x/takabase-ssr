/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MarkdownPluginService } from './markdown-plugin.service';
import MarkdownIt from 'markdown-it';
import MarkdownItIncrementalDOM from 'markdown-it-incremental-dom';
import * as IncrementalDOM from 'incremental-dom';
import * as mila from 'markdown-it-link-attributes';
import Prism from 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-scss';

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  private markdown = new MarkdownIt({
    linkify: true,
    breaks: true,
    highlight: (value: string, language: string = 'none'): string => {
      this.getCss();

      try {
        setTimeout(() => Prism.highlightAll());

        const prism = Prism.highlight(value, Prism.languages[language], language);

        return this.getTemplate(prism, language);
      } catch (e) {}

      return this.getTemplate(this.markdown.utils.escapeHtml(value));
    }
  })
    .use(mila, {
      attrs: {
        target: '_blank',
        rel: 'noopener'
      }
    })
    .use((md: any, options: any) => this.markdownPlugin.insert(md, options))
    .use(MarkdownItIncrementalDOM, IncrementalDOM);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private markdownPlugin: MarkdownPluginService
  ) {}

  getCss(): void {
    const cssId = 'prismjs-css';
    const cssHref = 'prismjs.css';

    if (!this.document.getElementById(cssId)) {
      const head = this.document.getElementsByTagName('head')[0];
      const style = this.document.createElement('link');

      style.id = cssId;
      style.rel = 'stylesheet';
      style.href = cssHref;

      head.appendChild(style);
    }
  }

  getTextarea(textarea: HTMLTextAreaElement): any {
    const { selectionStart, selectionEnd, value } = textarea;

    return {
      ...this.getPosition(value, selectionStart, selectionEnd),
      selection: value.substring(selectionStart, selectionEnd),
      selectionStart,
      selectionEnd,
      value
    };
  }

  getPosition(value: string, start: number, end: number): any {
    return {
      positionBefore: {
        space: value.substring(start - 1, end).search(/\S+/g) < 0,
        text: ((i = start): string => {
          do {
            i--;
          } while ((value[i - 1] || '').search(/\S+/g) >= 0);

          return value.substring(i, end).trim();
        })()
      },
      positionAfter: {
        space: value.substring(start, end + 1).search(/\S+/g) < 0,
        text: ((i = end): string => {
          do {
            i++;
          } while ((value[i - 1] || '').search(/\S+/g) >= 0);

          return value.substring(i, end).trim();
        })()
      }
    };
  }

  getTemplate(value: string, language: string = 'none'): string {
    const template = `
      <pre class="line-numbers language-${language}">
        <code class="language-${language}">${value}</code>
      </pre>
    `;

    return template.trim();
  }

  getRender(value: string, element: HTMLElement): void {
    // @ts-ignore
    IncrementalDOM.patch(element, this.markdown.renderToIncrementalDOM(value));
  }
}
