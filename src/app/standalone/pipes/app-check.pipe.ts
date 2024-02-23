/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first, map } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { PlatformService } from '../../core/services/platform.service';

@Pipe({
	standalone: true,
	name: 'appCheck'
})
export class AppCheckPipe implements PipeTransform {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly domSanitizer: DomSanitizer = inject(DomSanitizer);

	transform(value: string): Observable<SafeUrl> {
		if (this.platformService.isBrowser()) {
			return this.httpClient
				.get(value, {
					params: {
						alt: 'media'
					},
					responseType: 'blob'
				})
				.pipe(
					first(),
					map((blob: Blob) => this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)))
				);
		}

		return of('');
	}
}
