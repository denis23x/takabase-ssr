/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FileService } from './file.service';
import { SharpFetchDto } from '../dto/sharp/sharp-fetch.dto';
import { SharpOutputAppCheckDto } from '../dto/sharp/sharp-output-app-check.dto';
import { SharpOutputDownloadUrlDto } from '../dto/sharp/sharp-output-download-url.dto';

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

	/** Sharp function */

	getFetch(sharpFetchDto: SharpFetchDto): Observable<File> {
		return this.httpClient
			.get(this.setUrl('/v1/fetch'), {
				params: {
					...sharpFetchDto
				},
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => this.fileService.getFileFromBlob(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return this.apiService.setHttpErrorResponse(httpErrorResponse);
				})
			);
	}

	getOutputAppCheck(sharpOutputAppCheckDto: SharpOutputAppCheckDto): Observable<any> {
		return this.httpClient
			.get(this.setUrl('/v1/output/app-check'), {
				params: {
					...sharpOutputAppCheckDto
				},
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => URL.createObjectURL(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return this.apiService.setHttpErrorResponse(httpErrorResponse);
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
					return this.apiService.setHttpErrorResponse(httpErrorResponse);
				})
			);
	}
}
