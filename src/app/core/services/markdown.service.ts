/** @format */

import { inject, Injectable } from '@angular/core';
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
import { PlatformService } from './platform.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { MarkdownShortcut } from '../models/markdown.model';

@Injectable({
	providedIn: 'root'
})
export class MarkdownService {
	private readonly document: Document = inject(DOCUMENT);
	private readonly platformService: PlatformService = inject(PlatformService);

	// prettier-ignore
	markdownItClipboard: BehaviorSubject<ClipboardEventInit | undefined> = new BehaviorSubject<ClipboardEventInit | undefined>(undefined);
	markdownItShortcut: Subject<MarkdownShortcut | null> = new Subject<MarkdownShortcut | null>();

	markdownItCropperImage: BehaviorSubject<File | null> = new BehaviorSubject<File | null>(null);
	markdownItCropperToggle: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	markdownIt: MarkdownIt;

	getMarkdownIt(): MarkdownIt {
		if (this.markdownIt) {
			return this.markdownIt;
		}

		/** Set Prism autoloader */

		this.setMarkdownItPrism();

		/** Set markdown-it */

		this.markdownIt = new MarkdownIt({
			html: false,
			xhtmlOut: false,
			linkify: true,
			breaks: true,
			typographer: true,
			quotes: '“”‘’',
			highlight: (value: string, language: string): string => {
				if (this.platformService.isBrowser()) {
					// Not affecting hydration

					setTimeout(() => Prism.highlightAll());

					// prettier-ignore
					const prismTemplate = (value: string, language: string): string => {
            const getValue = (): string => {
              if (language === 'markup') {
                return value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
              }

              return value;
            }

            return `<pre class="line-numbers language-${language}" data-language="${language}"><code class="language-${language} match-braces rainbow-braces">${getValue()}</code></pre>`;
          };

					if (!!language && environment.prism.grammars.includes(language.toLowerCase())) {
						return prismTemplate(value, language);
					}

					return prismTemplate(this.markdownIt.utils.escapeHtml(value), 'plain');
				}

				return value;
			}
		})
			.use(attrs, {
				allowedAttributes: ['class', 'style', 'width', 'height']
			})
			.use(bracketedSpans)
			.use(collapsible)
			.use(emoji)
			.use(linkAttributes, [
				{
					matcher(href: string) {
						return href.match(/^https?:\/\//);
					},
					attrs: {
						target: '_blank',
						rel: 'ugc noopener noreferrer'
					}
				}
			])
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
				itemClass: 'form-control',
				inputClass: 'checkbox checkbox-success mr-4',
				labelClass: 'label cursor-pointer'
			})
			.use(video);

		this.markdownIt.renderer.rules.image = this.setMarkdownItRule('image');
		this.markdownIt.renderer.rules.video = this.setMarkdownItRule('video');
		this.markdownIt.renderer.rules.table_open = this.setMarkdownItRule('tableOpen');
		this.markdownIt.renderer.rules.table_close = this.setMarkdownItRule('tableClose');
		this.markdownIt.renderer.rules.collapsible_open = this.setMarkdownItRule('collapsibleOpen');

		// prettier-ignore
		this.markdownIt.renderer.rules.collapsible_summary = this.setMarkdownItRule('collapsibleSummary');
		this.markdownIt.renderer.rules.collapsible_close = this.setMarkdownItRule('collapsibleClose');

		return this.markdownIt;
	}

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
					// @ts-ignore
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

			// prettier-ignore
			iframeElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
			iframeElement.allowFullscreen = true;

			return iframeElement.outerHTML;
		};

		const ruleTableOpen: RenderRule = (tokenList: Token[], idx: number): string => {
			const tableElement: HTMLTableElement = this.document.createElement('table');

			const token: Token = tokenList[idx];

			token.attrs?.forEach(([key, value]: string[]) => {
				if (key === 'class') {
					// prettier-ignore
					const classList: string[] = value.split(/\s/).filter((className: string) => !!className);

					tableElement.classList.add(...classList);
				} else {
					// @ts-ignore
					tableElement[key] = value;
				}
			});

			return `<div class="overflow-auto my-4">${tableElement.outerHTML.replace('</table>', '')}`;
		};

		const ruleTableClose: RenderRule = (): string => {
			return `</table></div>`;
		};

		const ruleCollapsibleOpen: RenderRule = (): string => {
			return '<details class="collapse collapse-arrow bg-base-200 border border-base-content/20">';
		};

		const ruleCollapsibleSummary: RenderRule = (tokenList: Token[], idx: number): string => {
			return `<summary class="collapse-title text-xl font-medium">${tokenList[idx].content}</summary><div class="collapse-content">`;
		};

		const ruleCollapsibleClose: RenderRule = (): string => {
			return '</div></details>';
		};

		const ruleMap: any = {
			image: ruleImage,
			video: ruleVideo,
			tableOpen: ruleTableOpen,
			tableClose: ruleTableClose,
			collapsibleOpen: ruleCollapsibleOpen,
			collapsibleSummary: ruleCollapsibleSummary,
			collapsibleClose: ruleCollapsibleClose
		};

		return ruleMap[rule];
	}

	setMarkdownItPrism(): void {
		if (this.platformService.isBrowser()) {
			Prism.manual = true;
			Prism.plugins.autoloader.languages_path = '/assets/grammars/';
		}
	}

	setRender(value: string, element: HTMLElement): void {
		const cloneElement: HTMLElement = element.cloneNode(true) as HTMLElement;

		/** Set markdown-it render */

		cloneElement.innerHTML = this.getMarkdownIt().render(value);

		morphdom(element, cloneElement);
	}
}
