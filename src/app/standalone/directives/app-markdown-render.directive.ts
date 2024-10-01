/** @format */

import { Directive, ElementRef, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';
import { PlatformService } from '../../core/services/platform.service';
import { SanitizerPipe } from '../pipes/sanitizer.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from '../../core/services/helper.service';
import morphdom from 'morphdom';
import type MarkdownIt from 'markdown-it';
import type { PostType } from '../../core/models/post.model';

@Directive({
	standalone: true,
	selector: '[appMarkdownRender]',
	providers: [MarkdownService, SanitizerPipe]
})
export class MarkdownRenderDirective {
	private readonly markdownService: MarkdownService = inject(MarkdownService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly elementRef: ElementRef = inject(ElementRef);
	private readonly sanitizerPipe: SanitizerPipe = inject(SanitizerPipe);
	private readonly domSanitizer: DomSanitizer = inject(DomSanitizer);
	private readonly helperService: HelperService = inject(HelperService);

	@Output() appMarkdownRenderClickExternalLink: EventEmitter<string> = new EventEmitter<string>();

	@HostListener('click', ['$event'])
	onClick(event: Event): void {
		// prettier-ignore
		if (this.postType === 'category') {
			const target: HTMLElement = event.target as HTMLElement;
			const targetLinkGetter = (): HTMLAnchorElement | null => {
				if (target.tagName === 'A') {
					return target as HTMLAnchorElement;
				}

				if (target.parentElement.tagName === 'A') {
					return target.parentElement as HTMLAnchorElement;
				}

				return null;
			};
			const targetLink: HTMLAnchorElement | null = targetLinkGetter();

			// Check if the clicked element is a link
			if (targetLink) {
				const url: URL = this.helperService.getURL();

				// ... and it's external
				if (!targetLink.href.startsWith(url.origin)) {
					event.preventDefault();

					this.appMarkdownRenderClickExternalLink.emit(targetLink.href);
				}
			}
		}
	}

	@Input({ required: true })
	set appMarkdownRenderValue(value: string) {
		const markdownIt: MarkdownIt = this.markdownService.getMarkdownItServer();
		const markdownItElement: HTMLElement = this.elementRef.nativeElement.cloneNode(true) as HTMLElement;
		const markdownItRender = (markdownItValue: string): void => {
			markdownItElement.innerHTML = this.domSanitizer.sanitize(1, this.sanitizerPipe.transform(markdownItValue, 1));

			// Update DOM

			morphdom(this.elementRef.nativeElement, markdownItElement);
		};

		// SSR

		markdownItRender(markdownIt.render(value));

		if (this.platformService.isBrowser()) {
			this.markdownService
				.getMarkdownItBrowser()
				.then((markdownIt: MarkdownIt) => markdownItRender(markdownIt.render(value)))
				.catch((error: any) => console.error(error));
		}
	}

	@Input()
	set appMarkdownRenderPostType(postType: PostType) {
		this.postType = postType;
	}

	postType: PostType | undefined;
}
