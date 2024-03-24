/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { PlatformService } from '../../core/services/platform.service';

@Pipe({
	standalone: true,
	name: 'appCheck'
})
export class AppCheckPipe implements PipeTransform {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly httpClient: HttpClient = inject(HttpClient);

	transform(value: string): Observable<string> {
		if (this.platformService.isBrowser()) {
			return this.httpClient
				.get(value, {
					params: {
						alt: 'media'
					},
					responseType: 'blob'
				})
				.pipe(map((blob: Blob) => URL.createObjectURL(blob)));
		}

		return of('');
	}
}
