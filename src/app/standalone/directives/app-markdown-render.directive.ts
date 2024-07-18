/** @format */

import { Directive, ElementRef, inject, Input } from '@angular/core';
import { MarkdownService } from '../../core/services/markdown.service';
import { PlatformService } from '../../core/services/platform.service';
import { SanitizerPipe } from '../pipes/sanitizer.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import morphdom from 'morphdom';
import type MarkdownIt from 'markdown-it';

@Directive({
	standalone: true,
	selector: '[appMarkdownRender]',
	providers: [SanitizerPipe]
})
export class MarkdownRenderDirective {
	private readonly markdownService: MarkdownService = inject(MarkdownService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly elementRef: ElementRef = inject(ElementRef);
	private readonly sanitizerPipe: SanitizerPipe = inject(SanitizerPipe);
	private readonly domSanitizer: DomSanitizer = inject(DomSanitizer);

	@Input()
	set appMarkdownRenderValue(value: string) {
		if (this.platformService.isServer()) {
			const markdownIt: MarkdownIt = this.markdownService.getMarkdownItDefault();

			this.elementRef.nativeElement.innerHTML = markdownIt.render(value);
		} else {
			this.markdownService.getMarkdownIt(value).then((markdownIt: MarkdownIt) => {
				const cloneElement: HTMLElement = this.elementRef.nativeElement.cloneNode(true) as HTMLElement;
				const cloneElementValue: string = markdownIt.render(value);
				const cloneElementTrustHtml: string = this.sanitizerPipe.transform(cloneElementValue, 1) as string;

				cloneElement.innerHTML = this.domSanitizer.sanitize(1, cloneElementTrustHtml);

				/** Set output */

				morphdom(this.elementRef.nativeElement, cloneElement);
			});
		}
	}
}
