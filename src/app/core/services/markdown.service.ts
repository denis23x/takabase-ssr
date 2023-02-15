/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MarkdownPluginService } from './markdown-plugin.service';
import MarkdownIt from 'markdown-it';
import MarkdownItIncrementalDOM from 'markdown-it-incremental-dom';
import emoji from 'markdown-it-emoji';
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
			this.getHighlightCss();

			try {
				setTimeout(() => Prism.highlightAll());

				// prettier-ignore
				const prism = Prism.highlight(value, Prism.languages[language], language);

				return this.getHighlightTemplate(prism, language);
			} catch (error: any) {
				console.error(error);
			}

			return this.getHighlightTemplate(this.markdown.utils.escapeHtml(value));
		}
	})
		.use(mila, {
			attrs: {
				target: '_blank',
				rel: 'noopener'
			}
		})
		.use((md: any, options: any) => this.markdownPlugin.insert(md, options))
		.use(emoji)
		.use(MarkdownItIncrementalDOM, IncrementalDOM);

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private markdownPlugin: MarkdownPluginService
	) {
		this.markdown.renderer.rules.emoji = function (token, idx) {
			return `<span class="text-2xl">${token[idx].content}</span>`;
		};
	}

	getHighlightCss(): void {
		const cssId: string = 'prismjs-css';
		const cssHref: string = 'prismjs.css';

		if (!this.document.getElementById(cssId)) {
			// prettier-ignore
			const head: HTMLHeadElement = this.document.getElementsByTagName('head').item(0);
			const style: HTMLLinkElement = this.document.createElement('link');

			style.id = cssId;
			style.rel = 'stylesheet';
			style.href = cssHref;

			head.appendChild(style);
		}
	}

	getHighlightTemplate(value: string, language: string = 'none'): string {
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
