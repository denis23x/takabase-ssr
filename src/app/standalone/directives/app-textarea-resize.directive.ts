/** @format */

import {
	AfterViewInit,
	Directive,
	ElementRef,
	HostListener,
	OnDestroy
} from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Directive({
	standalone: true,
	selector: '[appTextareaResize]'
})
export class AppTextareaResizeDirective implements AfterViewInit, OnDestroy {
	@HostListener('input', ['$event']) onInput(inputEvent: InputEvent) {
		// prettier-ignore
		const textAreaElement: HTMLTextAreaElement = inputEvent.target as HTMLTextAreaElement;

		/** Scroll to bottom */

		const textAreaElementScrollToBottom: Set<number> = new Set([
			textAreaElement.value.length,
			textAreaElement.selectionStart,
			textAreaElement.selectionEnd
		]);

		if (textAreaElementScrollToBottom.size === 1) {
			textAreaElement.scrollTop = textAreaElement.scrollHeight;
		}
	}

	constructor(
		private platformService: PlatformService,
		private elementRef: ElementRef
	) {}

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			// @ts-ignore
			window.autosize(this.elementRef.nativeElement);
		}
	}

	ngOnDestroy(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			// @ts-ignore
			window.autosize.destroy(this.elementRef.nativeElement);
		}
	}
}
