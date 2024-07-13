/** @format */

import { AfterViewInit, Directive, ElementRef, HostListener, inject, Input, OnDestroy } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Directive({
	standalone: true,
	selector: '[appTextareaAutosize]'
})
export class TextareaAutosizeDirective implements AfterViewInit, OnDestroy {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly elementRef: ElementRef = inject(ElementRef);

	@HostListener('ngModelChange', ['$event']) ngModelChange(): void {
		/** Update autosize */

		this.setAutosize('update');

		/** Scroll to bottom */

		const textareaElement: HTMLTextAreaElement = this.elementRef.nativeElement;
		const textareaElementScrollToBottom: Set<number> = new Set([
			textareaElement.value.length,
			textareaElement.selectionStart,
			textareaElement.selectionEnd
		]);

		if (textareaElementScrollToBottom.size === 1) {
			textareaElement.scrollTop = textareaElement.scrollHeight;
		}
	}

	@Input()
	set appTextareaAutosizeToggle(textareaAutosizeToggle: boolean) {
		if (textareaAutosizeToggle) {
			if (this.textareaAutosizeState === 'destroy') {
				this.setAutosize();
			}
		} else {
			this.setAutosize('destroy');
		}
	}

	textareaAutosizeState: string | undefined;

	ngAfterViewInit(): void {
		this.setAutosize();
	}

	ngOnDestroy(): void {
		this.setAutosize('destroy');
	}

	setAutosize(method: string | undefined = undefined): void {
		if (this.platformService.isBrowser()) {
			const textarea: HTMLTextAreaElement = this.elementRef.nativeElement;

			import('autosize/dist/autosize.min')
				.then((module: any) => {
					if (method === undefined) {
						setTimeout(() => module.default(textarea));
					}

					if (method === 'update') {
						setTimeout(() => module.update(textarea));
					}

					if (method === 'destroy') {
						setTimeout(() => module.destroy(textarea));
					}
				})
				.catch((error: any) => console.error(error));

			// Save current state of autosize

			this.textareaAutosizeState = method;
		}
	}
}
