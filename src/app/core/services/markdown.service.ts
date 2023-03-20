/** @format */

import { Injectable } from '@angular/core';
import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import attrs from 'markdown-it-attrs';
import bracketedSpans from 'markdown-it-bracketed-spans';
import collapsible from 'markdown-it-collapsible';
import emoji from 'markdown-it-emoji';
import linkAttributes from 'markdown-it-link-attributes';
import mark from 'markdown-it-mark';
import multiMdTable from 'markdown-it-multimd-table';
import smartArrows from 'markdown-it-smartarrows';
import tasks from 'markdown-it-tasks';
import video from 'markdown-it-video';
import Prism from 'prismjs';
import morphdom from 'morphdom';
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
          const getValue = (): string => {
            if (language === 'markup') {
              return value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            }

            return value;
          }

          return `<pre class="line-numbers language-${language}"><code class="language-${language} match-braces rainbow-braces">${getValue()}</code></pre>`;
        };

				// prettier-ignore
				if (!!language && environment.grammars.includes(language.toLowerCase())) {
					return prismTemplate(value, language);
				}

				return prismTemplate(this.markdownIt.utils.escapeHtml(value), 'plain');
			}
		})
			.use(attrs, {
				allowedAttributes: ['class', 'width', 'height']
			})
			.use(bracketedSpans)
			.use(collapsible)
			.use(emoji)
			.use(linkAttributes, {
				attrs: {
					target: '_blank',
					rel: 'ugc noopener noreferrer'
				}
			})
			.use(mark)
			.use(multiMdTable, {
				multiline: true,
				rowspan: true,
				headerless: true,
				multibody: false,
				autolabel: false
			})
			.use(smartArrows)
			.use(tasks, {
				enabled: false,
				label: true,
				labelAfter: false,
				containerClass: 'form-control',
				itemClass: 'label !m-0',
				inputClass: 'checkbox block !my-0.5 !mr-4',
				labelClass: 'flex !m-0'
			})
			.use(video);

		/** Update Image */

		// TODO:
		// this.markdownIt.renderer.rules.image = (token: Token[], idx: number) => {
		// 	console.log(token);
		// 	console.log(idx);
		// 	return `<img src="${token[idx].attrs[0][1]}" loading="lazy" alt="${token[idx].content}" title="${token[idx].content}">`;
		// };

		/** Update Emoji Mart size */

		this.markdownIt.renderer.rules.emoji = (token: Token[], idx: number) => {
			return `<span class="text-2xl">${token[idx].content}</span>`;
		};

		/** Update Youtube Iframe */

		this.markdownIt.renderer.rules.video = (token: any[], idx: number) => {
			return `<iframe title="YouTube video player" width="640" height="390" loading="lazy" src="https://www.youtube-nocookie.com/embed/${token[idx].videoID}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
		};

		return this.markdownIt;
	}

	getRender(value: string): string {
		return this.getMarkdownIt().render(value);
	}

	setRender(value: string, element: HTMLElement): void {
		const cloneElement: HTMLElement = element.cloneNode(true) as HTMLElement;

		/** Set markdownIt render */

		cloneElement.innerHTML = this.getRender(value);

		morphdom(element, cloneElement);
	}
}
