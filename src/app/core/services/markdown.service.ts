/** @format */

import { inject, Injectable } from '@angular/core';
import { MarkdownItPlugins } from '../models/markdown.model';
import { AppearanceService } from './appearance.service';
import { DOCUMENT } from '@angular/common';
import { HelperService } from './helper.service';
import MarkdownIt from 'markdown-it';
import attrs from 'markdown-it-attrs';
import bracketedSpans from 'markdown-it-bracketed-spans';
import ins from 'markdown-it-ins';
import linkAttributes from 'markdown-it-link-attributes';
import tasks from 'markdown-it-tasks';
import type { Token } from 'markdown-it';

@Injectable()
export class MarkdownService {
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly document: Document = inject(DOCUMENT);
	private readonly helperService: HelperService = inject(HelperService);

	markdownItPlugins: string[] = [];
	markdownIt: MarkdownIt;

	getMarkdownItDefault(): MarkdownIt {
		/** Create new instance */

		const markdownIt: MarkdownIt = new MarkdownIt({
			html: false,
			xhtmlOut: false,
			linkify: true,
			breaks: true,
			typographer: true,
			quotes: '“”‘’',
			highlight: (value: string, language: string) => {
				if (language === 'mermaid') {
					return `<pre class="mermaid">${value}</pre>`;
				} else {
					return `<pre class="language-${language} line-numbers"><code class="language-${language} match-braces rainbow-braces">${markdownIt.utils.escapeHtml(value)}</code></pre>`;
				}
			}
		})
			.use(attrs, {
				allowedAttributes: ['class', 'style', 'width', 'height']
			})
			.use(bracketedSpans)
			.use(ins)
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
			.use(tasks, {
				enabled: true,
				label: true,
				labelAfter: false,
				itemClass: 'form-control',
				inputClass: 'checkbox checkbox-success mr-4',
				labelClass: 'label cursor-pointer'
			});

		/** Update default rules */

		markdownIt.renderer.rules.image = (tokenList: Token[], idx: number): string => {
			const imageElement: HTMLImageElement = this.document.createElement('img');

			const token: Token = tokenList[idx];

			token.attrs?.forEach(([key, value]: string[]) => {
				switch (key) {
					case 'class': {
						imageElement.classList.add(...value.split(/\s/).filter((className: string) => !!className));

						break;
					}
					case 'src': {
						imageElement.src = this.helperService.getImageURLQueryParams(value);

						break;
					}
					default: {
						// @ts-ignore
						imageElement[key] = value;

						break;
					}
				}
			});

			imageElement.loading = 'eager';
			imageElement.alt = token.content;
			imageElement.title = token.content;

			return imageElement.outerHTML;
		};

		markdownIt.renderer.rules.table_open = (tokenList: Token[], idx: number): string => {
			const tableElement: HTMLTableElement = this.document.createElement('table');

			const token: Token = tokenList[idx];

			token.attrs?.forEach(([key, value]: string[]) => {
				if (key === 'class') {
					const classList: string[] = value.split(/\s/).filter((className: string) => !!className);

					tableElement.classList.add(...classList);
				} else {
					// @ts-ignore
					tableElement[key] = value;
				}
			});

			return `<div class="overflow-auto my-4">${tableElement.outerHTML.replace('</table>', '')}`;
		};

		markdownIt.renderer.rules.table_close = (): string => {
			return `</table></div>`;
		};

		return markdownIt;
	}

	async getMarkdownIt(value: string): Promise<MarkdownIt> {
		const markdownItPlugins: MarkdownItPlugins = {
			prism: /```\s?(?!mermaid)([\w-]+)\n[\s\S]*?```/gm.test(value),
			mermaid: /```\s?(mermaid)\n[\s\S]*?```/gm.test(value),
			collapsible: /\+\+\+\s?\S[^\n]*\n[\s\S]*?\n\+\+\+/gim.test(value),
			emoji: /:([\+\-\w]+):/gm.test(value),
			smartArrows: /(-->|<--|<-->|==>|<==|<==>)/gm.test(value),
			video: /@\[(youtube|vimeo|vine|prezi|osf)]\(\s*https?:\/\/[^\s)]+\s*\)/gm.test(value)
		};

		// prettier-ignore
		const markdownItPluginsFiltered: any = Object.fromEntries(Object.entries(markdownItPlugins).filter(([key, value]) => value));
		const markdownItPluginsFilteredIsEqual = (arr1: string[], arr2: string[]): boolean => {
			if (arr1.length !== arr2.length) {
				return false;
			}

			const sortedArr1: string[] = arr1.slice().sort();
			const sortedArr2: string[] = arr2.slice().sort();

			for (let i = 0; i < sortedArr1.length; i++) {
				if (sortedArr1[i] !== sortedArr2[i]) {
					return false;
				}
			}

			return true;
		};

		const arr1: string[] = Object.keys(markdownItPluginsFiltered);
		const arr2: string[] = this.markdownItPlugins;

		// Avoid unnecessary re-init
		if (markdownItPluginsFilteredIsEqual(arr1, arr2)) {
			if (this.markdownIt) {
				return this.markdownIt;
			}
		}

		// Save list for next logic
		this.markdownItPlugins = Object.keys(markdownItPluginsFiltered);

		/** Markdown instance */

		const markdownIt: MarkdownIt = this.getMarkdownItDefault();

		/** Lazy load prepare */

		const markdownItModules: any[] = [];

		Object.keys(markdownItPluginsFiltered).forEach((key: string) => {
			if (key === 'prism') {
				markdownItModules.push(import('../markdown/plugins/prism'));
			}

			if (key === 'mermaid') {
				markdownItModules.push(import('../markdown/plugins/mermaid'));
			}

			if (key === 'collapsible') {
				markdownItModules.push(import('markdown-it-collapsible'));
			}

			if (key === 'emoji') {
				markdownItModules.push(import('markdown-it-emoji'));
			}

			if (key === 'smartArrows') {
				markdownItModules.push(import('markdown-it-smartarrows'));
			}

			if (key === 'video') {
				markdownItModules.push(import('markdown-it-video'));
			}
		});

		/** Lazy load */

		const markdownItModulesLoaded: any[] = await Promise.all(markdownItModules);

		/** Lazy load apply */

		Object.keys(markdownItPluginsFiltered).forEach((key: string, i: number) => {
			if (key === 'prism') {
				markdownIt.use(markdownItModulesLoaded[i].default);
			}

			if (key === 'mermaid') {
				/** https://mermaid.js.org/config/theming.html#customizing-themes-with-themevariables */

				markdownIt.use(markdownItModulesLoaded[i].default, {
					theme: 'base',
					themeVariables: {
						darkMode: false,
						background: this.appearanceService.getCSSColor('--b1', 'hex'),
						primaryColor: this.appearanceService.getCSSColor('--b1', 'hex'),
						primaryTextColor: this.appearanceService.getCSSColor('--bc', 'hex'),
						primaryBorderColor: this.appearanceService.getCSSColor('--p', 'hex'),
						secondaryColor: this.appearanceService.getCSSColor('--b1', 'hex'),
						secondaryTextColor: this.appearanceService.getCSSColor('--bc', 'hex'),
						secondaryBorderColor: this.appearanceService.getCSSColor('--s', 'hex'),
						lineColor: this.appearanceService.getCSSColor('--bc', 'hex'),
						textColor: this.appearanceService.getCSSColor('--bc', 'hex'),
						pie1: this.appearanceService.getCSSColor('--p', 'hex'),
						pie2: this.appearanceService.getCSSColor('--s', 'hex'),
						pie3: this.appearanceService.getCSSColor('--t', 'hex'),
						pie4: this.appearanceService.getCSSColor('--a', 'hex'),
						pie5: this.appearanceService.getCSSColor('--wa', 'hex'),
						pie6: this.appearanceService.getCSSColor('--er', 'hex')
					}
				});
			}

			if (key === 'collapsible') {
				markdownIt.use(markdownItModulesLoaded[i].default);

				/** Update rules */

				markdownIt.renderer.rules.collapsible_open = (): string => {
					return '<details class="collapse collapse-arrow bg-base-200 border border-base-content/20">';
				};

				markdownIt.renderer.rules.collapsible_summary = (tokenList: Token[], idx: number): string => {
					return `<summary class="collapse-title text-xl font-medium">${tokenList[idx].content}</summary><div class="collapse-content">`;
				};

				markdownIt.renderer.rules.collapsible_close = (): string => {
					return '</div></details>';
				};
			}

			if (key === 'emoji') {
				markdownIt.use(markdownItModulesLoaded[i].full);
			}

			if (key === 'smartArrows') {
				markdownIt.use(markdownItModulesLoaded[i].default);
			}

			if (key === 'video') {
				markdownIt.use(markdownItModulesLoaded[i].default);

				/** Update rules */

				markdownIt.renderer.rules.video = (tokenList: Token[], idx: number): string => {
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
			}
		});

		return (this.markdownIt = markdownIt);
	}

	getMarkdownItStripText(value: string): string {
		// Remove code blocks
		// value = value.replace(/```[\s\S]*?```/g, '');

		// Remove inline code
		// value = value.replace(/`[^`]*`/g, '');

		// Remove images
		value = value.replace(/!\[.*?\]\(.*?\)/g, '');

		// Remove links
		value = value.replace(/\[(.*?)\]\((.*?)\)/g, '$2');

		// Remove blockquotes
		value = value.replace(/^>+\s?/gm, '');

		// Remove headings
		value = value.replace(/^#+\s/gm, '');

		// Remove horizontal rules
		value = value.replace(/^---$/gm, '');

		// Remove horizontal rules
		value = value.replace(/^___$/gm, '');

		// Remove bold
		value = value.replace(/(\*\*|__)(.*?)\1/g, '$2');

		// Remove italic
		value = value.replace(/(\*|_)(.*?)\1/g, '$2');

		// Remove strikethrough
		value = value.replace(/~~(.*?)~~/g, '$1');

		// Remove unordered list markers
		value = value.replace(/^[\*\-\+]\s/gm, '');

		// Remove ordered list markers
		value = value.replace(/^\d+\.\s/gm, '');

		// Remove extra spaces and newlines
		value = value.replace(/\s+/g, ' ').trim();

		return value;
	}
}
