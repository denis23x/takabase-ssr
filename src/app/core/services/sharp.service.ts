/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FileService } from './file.service';
import type { SharpFetchDto } from '../dto/sharp/sharp-fetch.dto';
import type { SharpOutputDownloadUrlDto } from '../dto/sharp/sharp-output-download-url.dto';

@Injectable()
export class SharpService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly fileService: FileService = inject(FileService);

	setUrl(url: string): string {
		return environment.sharp.url + url;
	}

	getError(httpErrorResponse: HttpErrorResponse): Observable<HttpErrorResponse> {
		return from(new Response(httpErrorResponse.error).json()).pipe(
			map((error: any) => {
				return new HttpErrorResponse({
					error,
					status: 400,
					statusText: error.error
				});
			})
		);
	}

	/** Sharp function */

	getFetch(sharpFetchDto: SharpFetchDto): Observable<File> {
		return this.httpClient
			.get(this.setUrl('/v1/utilities/fetch'), {
				params: {
					...sharpFetchDto
				},
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => this.fileService.getFileFromBlob(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return this.getError(httpErrorResponse).pipe(
						switchMap((httpError: HttpErrorResponse) => this.apiService.setHttpErrorResponse(httpError))
					);
				})
			);
	}

	getOutputDownloadUrl(sharpOutputDownloadUrlDto: SharpOutputDownloadUrlDto): Observable<any> {
		return this.httpClient
			.get(this.setUrl('/v1/output/download-url'), {
				params: {
					...sharpOutputDownloadUrlDto
				}
			})
			.pipe(
				map((response: any) => response.data),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return this.apiService.setHttpErrorResponse(httpErrorResponse);
				})
			);
	}

	getOutputWebP(formData: FormData): Observable<File> {
		return this.httpClient
			.post(this.setUrl('/v1/output/webp'), formData, {
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => this.fileService.getFileFromBlob(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return this.getError(httpErrorResponse).pipe(
						switchMap((httpError: HttpErrorResponse) => this.apiService.setHttpErrorResponse(httpError))
					);
				})
			);
	}
}
