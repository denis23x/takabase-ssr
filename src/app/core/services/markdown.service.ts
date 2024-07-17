/** @format */

import { inject, Injectable } from '@angular/core';
import MarkdownIt, { Token } from 'markdown-it';
import morphdom from 'morphdom';
import { Subject } from 'rxjs';
import { MarkdownItPlugins, MarkdownShortcut } from '../models/markdown.model';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { AppearanceService } from './appearance.service';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HelperService } from './helper.service';
import attrs from 'markdown-it-attrs';
import bracketedSpans from 'markdown-it-bracketed-spans';
import ins from 'markdown-it-ins';
import linkAttributes from 'markdown-it-link-attributes';

@Injectable({
	providedIn: 'root'
})
export class MarkdownService {
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly document: Document = inject(DOCUMENT);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly helperService: HelperService = inject(HelperService);

	markdownItClipboard: Subject<ClipboardEventInit> = new Subject<ClipboardEventInit>();
	markdownItShortcut: Subject<MarkdownShortcut | null> = new Subject<MarkdownShortcut | null>();

	markdownItCropperImage: Subject<File> = new Subject<File>();
	markdownItCropperToggle: Subject<boolean> = new Subject<boolean>();

	markdownIt: MarkdownIt;

	getMarkdownIt(): MarkdownIt {
		if (this.markdownIt) {
			return this.markdownIt;
		}

		/** Set Prism autoloader */

		this.setMarkdownItPrism();

			if (key === 'tasks') {
				markdownItModules.push(import('markdown-it-tasks'));
			}

			if (key === 'video') {
				markdownItModules.push(import('markdown-it-video'));
			}
		});

		/** Lazy load */

		const markdownItModulesLoaded: any[] = await Promise.all(markdownItModules);

		/** Markdown instance */

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
					return `<pre class="language-${language} line-numbers"><code class="language-${language} match-braces rainbow-braces">${value}</code></pre>`;
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
			]);

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

			if (key === 'tasks') {
				// markdownIt.use(markdownItModulesLoaded[i].default, {
				// 	enabled: true,
				// 	label: true,
				// 	labelAfter: false,
				// 	itemClass: 'form-control',
				// 	inputClass: 'checkbox checkbox-success mr-4',
				// 	labelClass: 'label cursor-pointer'
				// });
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

		/** Update default rules */

		markdownIt.renderer.rules.image = (tokenList: Token[], idx: number): string => {
			const imageElement: HTMLImageElement = this.document.createElement('img');

			const token: Token = tokenList[idx];

			token.attrs?.forEach(([key, value]: string[]) => {
				switch (key) {
					case 'class': {
						const classList: string[] = value.split(/\s/).filter((className: string) => !!className);

						imageElement.classList.add(...classList);

						break;
					}
					case 'src': {
						if (value.includes(environment.firebase.storageBucket)) {
							imageElement.id = this.helperService.getNanoId(12);
							imageElement.src = './assets/images/placeholder-image.svg';

							this.httpClient
								.get(value, {
									params: {
										alt: 'media'
									},
									responseType: 'blob'
								})
								.pipe(map((blob: Blob) => URL.createObjectURL(blob)))
								.subscribe({
									next: (blob: string) => {
										const elementHTML: HTMLElement | null = this.document.getElementById(imageElement.id);
										const elementHTMLImage: HTMLImageElement = elementHTML as HTMLImageElement;

										/** Set Image */

										if (elementHTMLImage) {
											elementHTMLImage.src = blob;
										}
									},
									error: (error: any) => console.error(error)
								});
						} else {
							// @ts-ignore
							imageElement[key] = value;
						}

						break;
					}
					default: {
						// @ts-ignore
						imageElement[key] = value;

						break;
					}
				}
			});

			imageElement.loading = 'lazy';
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

	getMarkdownItAttrsConfig(): any {
		return {
			allowedAttributes: ['class', 'style', 'width', 'height']
		};
	}

	getMarkdownItLinkAttributesConfig(): any[] {
		return [
			{
				matcher(href: string) {
					return href.match(/^https?:\/\//);
				},
				attrs: {
					target: '_blank',
					rel: 'ugc noopener noreferrer'
				}
			}
		];
	}

	getMarkdownItMultiMdTableConfig(): any {
		return {
			multiline: true,
			rowspan: true,
			headerless: true,
			multibody: false,
			autolabel: false
		};
	}

	getMarkdownITasksConfig(): any {
		return {
			enabled: true,
			label: true,
			labelAfter: false,
			itemClass: 'form-control',
			inputClass: 'checkbox checkbox-success mr-4',
			labelClass: 'label cursor-pointer'
		};
	}

	getMarkdownItMermaidConfig(): any {
		return {
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
				textColor: this.appearanceService.getCSSColor('--bc', 'hex')
			}
		};
	}

	setRender(value: string, element: HTMLElement): void {
		const cloneElement: HTMLElement = element.cloneNode(true) as HTMLElement;

		/** Set markdown-it render */

		this.getMarkdownIt(value).then((markdownIt: MarkdownIt) => {
			cloneElement.innerHTML = markdownIt.render(value);

			morphdom(element, cloneElement);
		});
	}
}
