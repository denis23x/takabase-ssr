/** @format */

import { Injectable } from '@angular/core';
import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import MarkdownItIncrementalDOM from 'markdown-it-incremental-dom';
import emoji from 'markdown-it-emoji';
import * as IncrementalDOM from 'incremental-dom';
import * as mila from 'markdown-it-link-attributes';
import smartArrows from 'markdown-it-smartarrows';
import task from 'markdown-it-tasks';
import mark from 'markdown-it-mark';
import video from 'markdown-it-video';
import Prism from 'prismjs';
import 'prismjs/plugins/autolinker/prism-autolinker.min.js';
import 'prismjs/plugins/autoloader/prism-autoloader.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min.js';
import 'prismjs/plugins/match-braces/prism-match-braces.min.js';
import { environment } from '../../../environments/environment';

Prism.manual = true;
Prism.plugins.autoloader.languages_path = '/assets/grammars/';

@Injectable({
	providedIn: 'root'
})
export class MarkdownService {
	markdownIt: MarkdownIt;

	constructor() {}

	getMarkdownIt(): MarkdownIt {
		if (!!this.markdownIt) {
			return this.markdownIt;
		}

		this.markdownIt = new MarkdownIt({
			html: false,
			xhtmlOut: false,
			linkify: true,
			breaks: true,
			typographer: true,
			quotes: '“”‘’',
			highlight: (value: string, language: string): string => {
				setTimeout(() => Prism.highlightAll());

				// prettier-ignore
				const prismTemplate = (value: string, language: string): string => {
          return `<pre class="line-numbers language-${language}"><code class="language-${language} match-braces rainbow-braces">${value}</code></pre>`;
        };

				if (!!language && environment.grammars.includes(language)) {
					return prismTemplate(value, language);
				}

				return prismTemplate(this.markdownIt.utils.escapeHtml(value), 'plain');
			}
		})
			.use(mila, {
				attrs: {
					target: '_blank',
					rel: 'noopener'
				}
			})
			.use(mark)
			.use(smartArrows)
			.use(task, {
				enabled: false,
				label: true,
				labelAfter: false,
				containerClass: 'form-control',
				itemClass: 'label !m-0',
				// prettier-ignore
				inputClass: 'checkbox inline-block align-middle -translate-y-0.5 !my-0 !mr-4',
				labelClass: 'inline-block !m-0'
			})
			.use(video)
			.use(emoji)
			.use(MarkdownItIncrementalDOM, IncrementalDOM);

		this.markdownIt.renderer.rules.emoji = (token: Token[], idx: number) => {
			return `<span class="text-2xl">${token[idx].content}</span>`;
		};

		return this.markdownIt;
	}

	getRender(value: string, element: HTMLElement): void {
		const markdownIt: any = this.getMarkdownIt();

		// @ts-ignore
		IncrementalDOM.patch(element, markdownIt.renderToIncrementalDOM(value));
	}
}
