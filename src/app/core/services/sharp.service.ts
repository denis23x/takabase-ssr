/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FirebaseStorage, getDownloadURL, ref, StorageReference, uploadBytes, UploadMetadata } from 'firebase/storage';
import { HelperService } from './helper.service';
import { FirebaseService } from './firebase.service';
import mime from 'mime';
import dayjs from 'dayjs/esm';
import type { SharpFetchDto } from '../dto/sharp/sharp-fetch.dto';
import type { SharpOutputDownloadUrlDto } from '../dto/sharp/sharp-output-download-url.dto';
import type { FirebaseError } from 'firebase/app';

@Injectable()
export class SharpService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);

	/** Utility */

	getFileFromBlob(blob: Blob, fileName: string = 'image'): File {
		return new File([blob], [fileName, mime.getExtension(blob.type)].join('.'), {
			type: blob.type
		});
	}

	getFileName(file: File): string {
		const fileDate: number = Date.now();
		const fileId: string = this.helperService.getNanoId();
		const fileExtension: string = mime.getExtension(file.type);
		const fileName: string = [fileDate, fileId].join('-');

		return fileName + '.' + fileExtension;
	}

	getFileValidationMime(file: File, mimeTypes: string[]): boolean {
		return mimeTypes.includes(file.type);
	}

	getFileValidationSize(file: File, size: number): boolean {
		return file.size <= 1048576 * size;
	}

	getFileUrlClean(fileUrl: string): string {
		const url: URL = new URL(fileUrl);

		/** Remove query params (access token, ..etc) */

		return fileUrl.replace(url.search, '');
	}

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

	/** Firebase storage */

	create(file: File): Observable<string> {
		const fileName: string = this.getFileName(file);
		const filePath: string = ['temp', fileName].join('/');

		const storage: FirebaseStorage = this.firebaseService.getStorage();
		const storageRef: StorageReference = ref(storage, filePath);
		const storageRefMetadata: UploadMetadata = {
			cacheControl: 'public, max-age=31536000, immutable',
			contentDisposition: 'inline',
			contentType: file.type,
			customMetadata: {
				'Custom-Time': dayjs().format('YYYY-MM-DD[T]HH:mm:ss[Z]')
			}
		};

		return from(uploadBytes(storageRef, file, storageRefMetadata)).pipe(
			switchMap(() => getDownloadURL(storageRef)),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
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
				map((blob: Blob) => this.getFileFromBlob(blob)),
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
				map((blob: Blob) => this.getFileFromBlob(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return this.getError(httpErrorResponse).pipe(
						switchMap((httpError: HttpErrorResponse) => this.apiService.setHttpErrorResponse(httpError))
					);
				})
			);
	}
}
