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
import { MarkdownPosition, MarkdownTextarea } from '../models';

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
      } catch (error: any) {
        console.error(error);
      }

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
    @Inject(DOCUMENT)
    private document: Document,
    private markdownPlugin: MarkdownPluginService
  ) {}

  getCss(): void {
    const cssId: string = 'prismjs-css';
    const cssHref: string = 'prismjs.css';

    if (!this.document.getElementById(cssId)) {
      const head: HTMLHeadElement = this.document.getElementsByTagName('head').item(0);
      const style: HTMLLinkElement = this.document.createElement('link');

      style.id = cssId;
      style.rel = 'stylesheet';
      style.href = cssHref;

      head.appendChild(style);
    }
  }

  getTextarea(textarea: HTMLTextAreaElement): MarkdownTextarea {
    const { selectionStart, selectionEnd, value } = textarea;

    return {
      ...this.getPosition(value, selectionStart, selectionEnd),
      selection: value.substring(selectionStart, selectionEnd),
      selectionStart,
      selectionEnd,
      value
    };
  }

  getPosition(value: string, start: number, end: number): MarkdownPosition {
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
    const template: string = `
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
