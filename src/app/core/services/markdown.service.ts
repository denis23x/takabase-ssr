/** @format */

import { Injectable } from '@angular/core';
import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import emoji from 'markdown-it-emoji';
import mila from 'markdown-it-link-attributes';
import smartArrows from 'markdown-it-smartarrows';
import task from 'markdown-it-tasks';
import mark from 'markdown-it-mark';
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
			.use(emoji);

		/** Update Emoji Mart size */

		this.markdownIt.renderer.rules.emoji = (token: Token[], idx: number) => {
			return `<span class="text-2xl">${token[idx].content}</span>`;
		};

		/** Update Youtube Iframe */

		this.markdownIt.renderer.rules.video = (token: any[], idx: number) => {
			return `
        <iframe
          title="YouTube video player"
          width="640"
          height="390"
          src="https://www.youtube-nocookie.com/embed/${token[idx].videoID}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
			`;
		};

		return this.markdownIt;
	}

	getRender(value: string, element: HTMLElement): void {
		const makeRender = (): HTMLElement => {
			const markdownIt: MarkdownIt = this.getMarkdownIt();
			const render: HTMLElement = element.cloneNode(true) as HTMLElement;

			/** Set markdownIt render */

			render.innerHTML = markdownIt.render(value);

			return render;
		};

		morphdom(element, makeRender());
	}
}
