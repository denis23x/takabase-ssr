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
	@Output() appWindowClose: EventEmitter<void> = new EventEmitter<void>();

	@Input()
	set appWindowTitle(title: string) {
		this.captionTitle = title;
	}

	@Input()
	set appWindowButtons(buttonsList: string[]) {
		this.captionButtonsList = buttonsList;
	}

	captionTitle: string | undefined;
	captionButtonsList: string[] = [];
	captionButtonsPosition: string | undefined;

	fullscreenToggle: boolean = false;
	fullscreenClassList: string[] = [
		'max-h-[calc(100dvh-2rem)]',
		'max-w-[calc(100vw-2rem)]',
		'border',
		'border-base-content/20',
		'md:max-h-[80dvh]',
		'md:max-w-[calc(768px-4rem)]',
		'shadow-xl',
		'rounded-box'
	];

	constructor(private cookieService: CookieService) {}

	ngOnInit(): void {
		/** Apply appearance settings */

		this.setAppearance();
	}

	setAppearance(): void {
		this.captionButtonsPosition = this.cookieService.getItem('window-button-position') || 'left';
	}

	onClose(): void {
		this.appWindowClose.emit();
	}

	onFullscreen(toggle: boolean): void {
		this.fullscreenToggle = toggle;

		if (this.fullscreenToggle) {
			this.fullscreenClassList = ['w-full', 'h-full', 'fixed', 'left-0', 'top-0'];
		} else {
			this.fullscreenClassList = [
				'max-h-[calc(100dvh-2rem)]',
				'max-w-[calc(100vw-2rem)]',
				'border',
				'border-base-content/20',
				'md:max-h-[80dvh]',
				'md:max-w-[calc(768px-4rem)]',
				'shadow-xl',
				'rounded-box'
			];
		}
	}
}
