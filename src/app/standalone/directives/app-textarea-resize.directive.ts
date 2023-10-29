/** @format */

import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';
import { BehaviorSubject } from 'rxjs';

@Directive({
	standalone: true,
	selector: '[appTextareaResize]'
})
export class AppTextareaResizeDirective implements OnInit, OnDestroy {
	@HostListener('input', ['$event']) onInput(inputEvent: InputEvent) {
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
		this.toggleResize$.next(toggleResize);
	}

	toggleResize$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private platformService: PlatformService,
		private elementRef: ElementRef
	) {}

	ngOnInit(): void {
		this.toggleResize$.subscribe({
			next: (toggleResize: boolean) => this.setAutoresize(toggleResize),
			error: (error: any) => console.error(error),
			complete: () => this.setAutoresize(false)
		});
	}

	ngOnDestroy(): void {
		this.toggleResize$.complete();
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
