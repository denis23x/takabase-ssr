/** @format */

import {
	AfterViewInit,
	Directive,
	ElementRef,
	HostListener,
	Input,
	OnDestroy
} from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Directive({
	standalone: true,
	selector: '[appTextareaAutosize]'
})
export class TextareaAutosizeDirective implements AfterViewInit, OnDestroy {
	@HostListener('ngModelChange', ['$event']) ngModelChange() {
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
	set appAutosizeToggle(autosizeToggle: boolean) {
		if (autosizeToggle) {
			if (this.autosizeState === 'destroy') {
				this.setAutosize();
			}
		} else {
			this.setAutosize('destroy');
		}
	}

	autosizeState: string | undefined;

	constructor(
		private platformService: PlatformService,
		private elementRef: ElementRef
	) {}

	ngAfterViewInit(): void {
		this.setAutosize();
	}

	ngOnDestroy(): void {
		this.setAutosize('destroy');
	}

	setAutosize(method: string | undefined = undefined): void {
		// Not affecting hydration

		if (this.platformService.isBrowser()) {
			const window: any = this.platformService.getWindow();
			const windowTextarea: HTMLTextAreaElement = this.elementRef.nativeElement;

			if (method === undefined) {
				setTimeout(() => window.autosize(windowTextarea));
			}

			if (method === 'update') {
				setTimeout(() => window.autosize.update(windowTextarea));
			}

			if (method === 'destroy') {
				setTimeout(() => window.autosize.destroy(windowTextarea));
			}

			// Save current state of autosize

			this.autosizeState = method;
		}
	}
}
