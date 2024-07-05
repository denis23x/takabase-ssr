/** @format */

import { Directive, HostListener, inject, Input } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { HelperService } from '../../core/services/helper.service';

@Directive({
	standalone: true,
	selector: '[appCopyToClipboard]'
})
export class CopyToClipboardDirective {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly helperService: HelperService = inject(HelperService);

	@Input()
	set appCopyToClipboardValue(clipboardValue: string) {
		this.clipboardValue = clipboardValue;
	}

	@Input()
	set appCopyToClipboardMessage(clipboardMessage: string) {
		this.clipboardMessage = clipboardMessage;
	}

	clipboardValue: string | undefined;
	clipboardMessage: string = 'Link has been copied';

	@HostListener('click', ['$event']) onClick(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			this.helperService.getNavigatorClipboard(this.clipboardValue || window.location.href).subscribe({
				next: () => this.snackbarService.success('Easy', this.clipboardMessage),
				error: (error: any) => console.error(error)
			});
		}
	}
}
