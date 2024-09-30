/** @format */

import { inject, Injectable } from '@angular/core';
import { AppearanceService } from './appearance.service';
import { DOCUMENT } from '@angular/common';
import { BusService } from './bus.service';
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
	private readonly busService: BusService = inject(BusService);

	getMarkdownItServer(): MarkdownIt {
		if (this.busService.markdownItServer) {
			return this.busService.markdownItServer;
		} else {
			const markdownIt: MarkdownIt = new MarkdownIt({
				html: false,
				xhtmlOut: false,
				linkify: true,
				breaks: true,
				typographer: true,
				quotes: '“”‘’',
				highlight: (value: string, language: string) => {
					switch (language) {
						case 'mermaid': {
							return `<pre class="mermaid">${value}</pre>`;
						}
						case 'treeview': {
							return `<pre class="language-${language}"><code class="language-${language}">${value}</code></pre>`;
						}
						default: {
							return `<pre class="language-${language} line-numbers"><code class="language-${language} match-braces rainbow-braces">${markdownIt.utils.escapeHtml(value)}</code></pre>`;
						}
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
							rel: 'ugc nofollow noopener noreferrer'
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
				const token: Token = tokenList[idx];
				const tokenGetValueByKey = (attrList: [string, string][], key: string): string | undefined => {
					return attrList.find(([k]: string[]) => k === key)?.[1] || undefined;
				};

				const imageSrc: string | undefined = tokenGetValueByKey(token.attrs, 'src');
				const imageAlt: string = token.content;
				const imageWidth: string = tokenGetValueByKey(token.attrs, 'width') || 'auto';
				const imageHeight: string = tokenGetValueByKey(token.attrs, 'height') || 'auto';
				const imageClass: string = tokenGetValueByKey(token.attrs, 'class') || '';

				const elementImg: string = `<img src="${imageSrc}" width="${imageWidth}" height="${imageHeight}" loading="eager" alt="${imageAlt}">`;
				const elementLink: string = `<a class="flex items-center justify-center" href="${imageSrc}" target="_blank" rel="nofollow ugc" title="Open Image" aria-label="Open Image">${elementImg}</a>`;
				const elementFigCaption: string = `<figcaption>${imageAlt}</figcaption>`;

				if (imageClass) {
					return `<figure class="${imageClass}">${elementLink}</figure>`;
				} else {
					return `<figure class="${imageClass}">${elementLink}${elementFigCaption}</figure>`;
				}
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

			return (this.busService.markdownItServer = markdownIt);
		}
	}

	async getMarkdownItBrowser(): Promise<MarkdownIt> {
		if (this.busService.markdownItBrowser) {
			return this.busService.markdownItBrowser;
		} else {
			const markdownIt: MarkdownIt = this.getMarkdownItServer();
			const markdownItPlugins: any[] = [
				import('../markdown/plugins/mermaid'),
				import('../markdown/plugins/preview'),
				import('../markdown/plugins/prism'),
				import('markdown-it-collapsible'),
				import('markdown-it-emoji'),
				import('markdown-it-smartarrows'),
				import('markdown-it-video')
			];

			/** Lazy load */

			return Promise.all(markdownItPlugins).then((plugins: any[]) => {
				markdownIt.use(plugins[0].default, {
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

				markdownIt.use(plugins[1].default);

				markdownIt.use(plugins[2].default);

				markdownIt.use(plugins[3].default);

				markdownIt.renderer.rules.collapsible_open = (): string => {
					return '<details class="collapse collapse-arrow">';
				};

				markdownIt.renderer.rules.collapsible_summary = (tokenList: Token[], idx: number): string => {
					return `<summary class="collapse-title">${tokenList[idx].content}</summary><div class="collapse-content">`;
				};

				markdownIt.renderer.rules.collapsible_close = (): string => {
					return '</div></details>';
				};

				markdownIt.use(plugins[4].full);

				markdownIt.use(plugins[5].default);

				markdownIt.use(plugins[6].default);

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

				return (this.busService.markdownItBrowser = markdownIt);
			});
		}
	}

	getMarkdownItRawText(value: string): string {
		// Remove emoji
		value = value.replace(/:([\+\-\w]+):/gm, '');

		// Remove arbitrary classes
		value = value.replace(/\{[^}]*\}/g, '');

		// Remove code blocks
		value = value.replace(/```[\s\S]*?```/g, '');

		// Remove inline code
		value = value.replace(/`([^`]*)`/g, '$1');

		// Remove images
		value = value.replace(/!\[.*?\]\(.*?\)/g, '');

		// Remove links
		value = value.replace(/\[(.*?)\]\((.*?)\)/g, '');

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

	getMarkdownItTags(stripedText: string, tagsLimit: number = 10): string[] {
		const stopWords: Set<string> = new Set([
			'all',
			'also',
			'an',
			'and',
			'are',
			'as',
			'at',
			'be',
			'below',
			'but',
			'by',
			'can',
			'com',
			'do',
			'does',
			'else',
			'end',
			'for',
			'from',
			'has',
			'have',
			'if',
			'in',
			'io',
			'is',
			'it',
			'just',
			'many',
			'me',
			'much',
			'my',
			'need',
			'not',
			'of',
			'on',
			'or',
			'should',
			'so',
			'such',
			'that',
			'the',
			'then',
			'there',
			'this',
			'to',
			'use',
			'was',
			'we',
			'when',
			'which',
			'why',
			'will',
			'with',
			'would',
			'you',
			'your'
		]);

		const irregularPlurals: Record<string, string> = {
			children: 'child',
			men: 'man',
			women: 'woman',
			feet: 'foot',
			teeth: 'tooth',
			mice: 'mouse',
			geese: 'goose',
			oxen: 'ox',
			people: 'person'
		};

		// Helper to get for singular
		const getWordSingular = (word: string): string => {
			if (irregularPlurals[word.toLowerCase()]) {
				return irregularPlurals[word.toLowerCase()];
			} else if (word.length > 2) {
				if (word.endsWith('ies') && word.length > 4) {
					return word.slice(0, -3) + 'y'; // e.g., 'cities' -> 'city'
				} else if (word.endsWith('ves')) {
					return word.slice(0, -3) + 'f'; // e.g., 'leaves' -> 'leaf'
				} else if (word.endsWith('es') && /(?:sh|ch|ss|x|z)es$/.test(word)) {
					return word.slice(0, -2); // e.g., 'boxes' -> 'box', 'wishes' -> 'wish'
				} else if (word.endsWith('s') && !word.endsWith('ss')) {
					return word.slice(0, -1); // e.g., 'cats' -> 'cat', 'cases' -> 'case'
				}
			}

			return word;
		};

		// Helper to get frequency of words in the originalText
		const getWordFrequency = (text: string): Map<string, number> => {
			const wordMap: Map<string, number> = new Map();
			const words: string[] = text.toLowerCase().match(/\b\w+\b(?!')(?<!')/g) || [];

			words
				.filter((word: string) => word.length >= 2)
				.filter((word: string) => !Number(word))
				.filter((word: string) => !word.endsWith('ing'))
				.filter((word: string) => !stopWords.has(word))
				.map((word: string) => getWordSingular(word))
				.forEach((word: string) => wordMap.set(word, (wordMap.get(word) || 0) + 1));

			return wordMap;
		};

		// Sort words by frequency and filter out less meaningful ones
		return Array.from(getWordFrequency(stripedText).entries())
			.sort((a: any[], b: any[]) => b[1] - a[1])
			.slice(0, tagsLimit)
			.map(([word]: [string, number]) => word);
	}
}
