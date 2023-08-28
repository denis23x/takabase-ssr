/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import { CookieService } from '../../../core/services/cookie.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent, SnackbarComponent],
	selector: 'app-window, [appWindow]',
	templateUrl: 'window.component.html'
})
export class WindowComponent implements OnInit {
	@Input()
	set appTitle(title: string) {
		this.captionTitle = title;
	}

	@Input()
	set appButtons(buttonsList: string[]) {
		this.captionButtonsList = buttonsList;
	}

	@Output() closed: EventEmitter<void> = new EventEmitter<void>();

	captionTitle: string | undefined;
	captionButtonsList: string[] = [];
	captionButtonsPosition: string = 'left';

	fullscreenToggle: boolean = false;
	fullscreenClassList: string[] = [
		'h-auto',
		'w-auto',
		'max-h-[calc(100vh-2rem)]',
		'max-w-[calc(100vw-2rem)]',
		'border',
		'border-base-content/20',
		'md:max-h-[80vh]',
		'md:max-w-[calc(768px-4rem)]',
		'shadow-xl',
		'rounded-box'
	];

	constructor(private cookieService: CookieService) {}

	ngOnInit(): void {
		/** Set appearance settings */

		this.setAppearance();
	}

	setAppearance(): void {
		// prettier-ignore
		this.captionButtonsPosition = this.cookieService.getItem('window-button-position') || 'left';
	}

	onClose(): void {
		this.closed.emit();
	}

	onFullscreen(toggle: boolean): void {
		this.fullscreenToggle = toggle;

		if (this.fullscreenToggle) {
			this.fullscreenClassList = [
				'w-full',
				'h-full',
				'fixed',
				'left-0',
				'top-0'
			];
		} else {
			this.fullscreenClassList = [
				'h-auto',
				'w-auto',
				'max-h-[calc(100vh-2rem)]',
				'max-w-[calc(100vw-2rem)]',
				'border',
				'border-base-content/20',
				'md:max-h-[80vh]',
				'md:max-w-[calc(768px-4rem)]',
				'shadow-xl',
				'rounded-box'
			];
		}
	}
}
