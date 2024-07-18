/** @format */

import { inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';
import { PlatformService } from '../../core/services/platform.service';

@Pipe({
	standalone: true,
	name: 'sanitizer'
})
export class SanitizerPipe implements PipeTransform {
	private readonly domSanitizer: DomSanitizer = inject(DomSanitizer);
	private readonly platformService: PlatformService = inject(PlatformService);

	transform(value: string, context: SecurityContext): SafeValue {
		if (this.platformService.isBrowser()) {
			return this.bypassSecurityTrust(value, context);
		}

		return value;
	}

	private bypassSecurityTrust(value: string, context: SecurityContext): SafeValue | null {
		switch (context) {
			case 1:
				return this.domSanitizer.bypassSecurityTrustHtml(value);
			case 2:
				return this.domSanitizer.bypassSecurityTrustStyle(value);
			case 3:
				return this.domSanitizer.bypassSecurityTrustScript(value);
			case 4:
				return this.domSanitizer.bypassSecurityTrustUrl(value);
			case 5:
				return this.domSanitizer.bypassSecurityTrustResourceUrl(value);
			default:
				throw new Error('Invalid security context specified: ' + context);
		}
	}
}
