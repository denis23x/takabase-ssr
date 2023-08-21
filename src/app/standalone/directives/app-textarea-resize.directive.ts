/** @format */

import {
	Directive,
	ElementRef,
	HostListener,
	Input,
	OnDestroy
} from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Directive({
	standalone: true,
	selector: '[appTextareaResize]'
})
export class AppTextareaResizeDirective implements OnDestroy {
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

	@Input()
	set appToggleResize(toggleResize: boolean) {
		this.setAutoresize(toggleResize);
	}

	constructor(
		private platformService: PlatformService,
		private elementRef: ElementRef
	) {}

	ngOnDestroy(): void {
		this.setAutoresize(false);
	}

	setAutoresize(toggle: boolean): void {
		if (this.platformService.isBrowser()) {
			const window: any = this.platformService.getWindow();

			if (toggle) {
				window.autosize(this.elementRef.nativeElement);
			} else {
				window.autosize.destroy(this.elementRef.nativeElement);
			}
		}
	}
}
