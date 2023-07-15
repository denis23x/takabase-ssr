/** @format */

import { Inject, Injectable } from '@angular/core';
import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import attrs from 'markdown-it-attrs';
import bracketedSpans from 'markdown-it-bracketed-spans';
import collapsible from 'markdown-it-collapsible';
import emoji from 'markdown-it-emoji';
import linkAttributes from 'markdown-it-link-attributes';
import mark from 'markdown-it-mark';
import multiMdTable from 'markdown-it-multimd-table';
import plainText from 'markdown-it-plain-text';
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
import { RenderRule } from 'markdown-it/lib/renderer';
import { DOCUMENT } from '@angular/common';

Prism.manual = true;
Prism.plugins.autoloader.languages_path = '/assets/grammars/';

@Injectable({
	providedIn: 'root'
})
export class MarkdownService {
	markdownIt: MarkdownIt;

	constructor(
		@Inject(DOCUMENT)
		private document: Document
	) {}

	getMarkdownIt(): MarkdownIt {
		if (this.markdownIt) {
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
				allowedAttributes: ['class', 'style', 'width', 'height']
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
			.use(plainText)
			.use(smartArrows)
			.use(tasks, {
				enabled: true,
				label: true,
				labelAfter: false,
				containerClass: 'form-control',
				itemClass: 'label flex-col items-start pointer-events-none m-0 px-0',
				inputClass: 'checkbox checkbox-success block my-0.5 ml-0.5 mr-4',
				labelClass: 'flex m-0'
			})
			.use(video);

		this.markdownIt.renderer.rules.image = this.setMarkdownItRule('image');
		this.markdownIt.renderer.rules.video = this.setMarkdownItRule('video');

		// prettier-ignore
		this.markdownIt.renderer.rules.table_open = this.setMarkdownItRule('tableOpen');

		// prettier-ignore
		this.markdownIt.renderer.rules.table_close = this.setMarkdownItRule('tableClose');

		// prettier-ignore
		this.markdownIt.renderer.rules.collapsible_summary = this.setMarkdownItRule('collapsibleSummary');

		return this.markdownIt;
	}

	// prettier-ignore
	setMarkdownItRule(rule: string): RenderRule {
		const ruleImage: RenderRule = (tokenList: Token[], idx: number): string => {
			const imageElement: HTMLImageElement = this.document.createElement('img');

			const token: Token = tokenList[idx];

			token.attrs?.forEach(([key, value]: string[]) => {
				if (key === 'class') {
					// prettier-ignore
					const classList: string[] = value.split(/\s/).filter((className: string) => !!className);

					imageElement.classList.add(...classList);
				} else {
					imageElement[key] = value;
				}
			});

			imageElement.loading = 'lazy';
			imageElement.alt = token.content;
			imageElement.title = token.content;

			return imageElement.outerHTML;
		};

		const ruleVideo: RenderRule = (tokenList: Token[], idx: number): string => {
      const iframeSrc: string = 'https://www.youtube-nocookie.com/embed/';
      const iframeElement: HTMLIFrameElement = this.document.createElement('iframe');

      const token: Token = tokenList[idx];

      // @ts-ignore
      iframeElement.loading = 'lazy';

      // @ts-ignore
      iframeElement.src = iframeSrc + token.videoID;
      iframeElement.width = String(640);
      iframeElement.height = String(390);
      iframeElement.title = 'YouTube video player';
      iframeElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframeElement.allowFullscreen = true;

      return iframeElement.outerHTML;
    };

		const ruleTableOpen: RenderRule = (tokenList: Token[], idx: number) => {
      const tableElement: HTMLTableElement = this.document.createElement('table');

      const token: Token = tokenList[idx];

      token.attrs?.forEach(([key, value]: string[]) => {
        if (key === 'class') {
          // prettier-ignore
          const classList: string[] = value.split(/\s/).filter((className: string) => !!className);

          tableElement.classList.add(...classList);
        } else {
          tableElement[key] = value;
        }
      });

      return `<div class="overflow-auto my-4">${tableElement.outerHTML.replace('</table>', '')}`;
    };

		const ruleTableClose: RenderRule = () => {
			return `</table></div>`;
		};

    const ruleCollapsibleSummary: RenderRule = (tokenList: Token[], idx: number) => {
      return `<summary><span class="block">${tokenList[idx].content}</span></summary>`;
    };

		const ruleMap: any = {
			image: ruleImage,
			video: ruleVideo,
			tableOpen: ruleTableOpen,
			tableClose: ruleTableClose,
      collapsibleSummary: ruleCollapsibleSummary
		};

		return ruleMap[rule];
	}

	setRender(value: string, element: HTMLElement): void {
		const cloneElement: HTMLElement = element.cloneNode(true) as HTMLElement;

		/** Set markdownIt render */

		cloneElement.innerHTML = this.getMarkdownIt().render(value);

		morphdom(element, cloneElement);
	}
}
