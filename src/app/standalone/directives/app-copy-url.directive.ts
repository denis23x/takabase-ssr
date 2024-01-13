/** @format */

import { Directive, HostListener, inject } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';
import { SnackbarService } from '../../core/services/snackbar.service';

@Directive({
	standalone: true,
	selector: '[appCopyUrl]'
})
export class CopyUrlDirective {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	@HostListener('click', ['$event']) onClick() {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			window.navigator.clipboard
				.writeText(window.location.href)
				.then(() => this.snackbarService.success('Done', 'URL has been copied'))
				.catch(() => this.snackbarService.error('Error', 'Failed to copy'));
		}
	}
}
