/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FileService } from './file.service';
import { SharpFetchDto } from '../dto/sharp/sharp-fetch.dto';

@Injectable({
	providedIn: 'root'
})
export class SharpService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly fileService: FileService = inject(FileService);

	setUrl(url: string): string {
		return environment.sharp.url + url;
	}

	/** IPA function */

	getFetch(sharpFetchDto: SharpFetchDto): Observable<File> {
		return this.httpClient
			.get(this.setUrl('/fetch'), {
				params: {
					...sharpFetchDto
				},
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => this.fileService.getFileFromBlob(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					httpErrorResponse.error.message = 'Invalid image type';

					return this.apiService.setHttpErrorResponse(httpErrorResponse);
				})
			);
	}

	getOutputWebP(formData: FormData): Observable<File> {
		return this.httpClient
			.post(this.setUrl('/output/webp'), formData, {
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => this.fileService.getFileFromBlob(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					httpErrorResponse.error.message = 'Unable to process image. Please try again later';

					return this.apiService.setHttpErrorResponse(httpErrorResponse);
				})
			);
	}
}
