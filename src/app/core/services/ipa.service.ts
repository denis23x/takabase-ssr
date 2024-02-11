/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IPAOperation } from '../dto/ipa/ipa-operation.dto';
import { FileService } from './file.service';
import { FirebaseError } from '@angular/fire/app';
import firebase from 'firebase/compat';

@Injectable({
	providedIn: 'root'
})
export class IPAService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly fileService: FileService = inject(FileService);
	private readonly angularFireStorage: AngularFireStorage = inject(AngularFireStorage);

	setUrl(url: string): string {
		return environment.ipa.url + url;
	}

	getParams(IPAOperationParams: IPAOperation[]): string {
		return '?operations=' + this.getParamsEncode(IPAOperationParams);
	}

	getParamsEncode(IPAOperationParams: IPAOperation[]): string {
		return encodeURIComponent(JSON.stringify(IPAOperationParams));
	}

	/** IPA function */

	create(fileAlpha: File): Observable<string> {
		// prettier-ignore
		const ipaStorageBucket: firebase.storage.Storage = this.angularFireStorage.storage.app.storage(environment.ipa.bucket);
		const ipaStorageBucketFileName: string = this.fileService.getFileName(fileAlpha);

		return from(ipaStorageBucket.ref(ipaStorageBucketFileName).put(fileAlpha)).pipe(
			switchMap(() => of(ipaStorageBucket.ref(ipaStorageBucketFileName).fullPath)),
			catchError((firebaseError: FirebaseError) => this.apiService.setError(firebaseError))
		);
	}

	getOneViaProxy(url: string): Observable<File> {
		const ipaOperationParams: IPAOperation[] = [
			{
				operation: 'input',
				type: 'url',
				url: url.trim()
			},
			{
				operation: 'output',
				format: 'webp'
			}
		];

		return this.httpClient
			.get(this.setUrl(this.getParams(ipaOperationParams)), {
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => this.fileService.getFileFromBlob(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					httpErrorResponse.error.message = 'Invalid image type';

					return this.apiService.setError(httpErrorResponse);
				})
			);
	}

	getOneViaGCS(ipaOperationParams: IPAOperation[]): Observable<File> {
		return this.httpClient
			.get(this.setUrl(this.getParams(ipaOperationParams)), {
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => this.fileService.getFileFromBlob(blob)),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					httpErrorResponse.error.message = 'Unable to process image. Please try again later';

					return this.apiService.setError(httpErrorResponse);
				})
			);
	}
}
