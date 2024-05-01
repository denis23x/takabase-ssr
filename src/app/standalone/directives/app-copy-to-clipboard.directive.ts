/** @format */

import { Directive, HostListener, inject, Input } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';
import { SnackbarService } from '../../core/services/snackbar.service';

@Directive({
	standalone: true,
	selector: '[appCopyToClipboard]'
})
export class CopyToClipboardDirective {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	@Input()
	set appCopyToClipboardValue(copyToClipboardValue: string) {
		this.copyToClipboardValue = copyToClipboardValue;
	}

	@Input()
	set appCopyToClipboardMessage(copyToClipboardMessage: string) {
		this.copyToClipboardMessage = copyToClipboardMessage;
	}

	copyToClipboardValue: string | undefined;
	copyToClipboardMessage: string = 'URL has been copied';

	@HostListener('click', ['$event']) onClick() {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			window.navigator.clipboard
				.writeText(this.copyToClipboardValue || window.location.href)
				.then(() => this.snackbarService.success('Easy', this.copyToClipboardMessage))
				.catch(() => this.snackbarService.error('Error', 'Failed to copy'));
		}
	}
}
