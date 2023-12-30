/** @format */

import { Inject, Injectable } from '@angular/core';
import { from, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IPAOperation } from '../dto/ipa/ipa-operation.dto';
import { FileService } from './file.service';
import { PlatformService } from './platform.service';
import { DOCUMENT } from '@angular/common';
import firebase from 'firebase/compat';

@Injectable({
	providedIn: 'root'
})
export class IPAService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private apiService: ApiService,
		private httpClient: HttpClient,
		private fileService: FileService,
		private platformService: PlatformService,
		private angularFireStorage: AngularFireStorage
	) {}

	/** Utility */

	getParams(IPAOperationParams: IPAOperation[]): string {
		return '?operations=' + this.getParamsEncode(IPAOperationParams);
	}

	getParamsEncode(IPAOperationParams: IPAOperation[]): string {
		return encodeURIComponent(JSON.stringify(IPAOperationParams));
	}

	setImageAlphaMime(file: File): Promise<File> {
		return new Promise((resolve, reject): void => {
			if (this.platformService.isBrowser()) {
				const alphaMime: string[] = ['image/png', 'image/webp'];

				if (alphaMime.includes(file.type)) {
					resolve(file);
				} else {
					const canvasElement: HTMLCanvasElement = this.document.createElement('canvas');
					const canvasElementContext: CanvasRenderingContext2D = canvasElement.getContext('2d');

					const window: any = this.platformService.getWindow();

					const imageElement: HTMLImageElement = new Image();
					const imageElementUrl: string = window.URL.createObjectURL(file);

					imageElement.onerror = (event: string | Event) => reject(event);
					imageElement.onload = (event: any) => {
						canvasElement.width = event.target.width;
						canvasElement.height = event.target.height;

						// prettier-ignore
						canvasElementContext.drawImage(event.target, 0, 0, event.target.width, event.target.height);

						/** Replace File extension */

						const fileName: string = file.name.replace(new RegExp('.[a-z]+$', 'i'), '.png');

						// prettier-ignore
						canvasElement.toBlob((blob: Blob) => resolve(this.fileService.getFileFromBlob(blob, fileName)), 'image/png', 1);
					};

					imageElement.src = imageElementUrl;
				}
			}
		});
	}

	setImageAlphaExtendOperation(file: File): Promise<IPAOperation | null> {
		return new Promise((resolve, reject): void => {
			const fileReader: FileReader = new FileReader();

			fileReader.onerror = (progressEvent: ProgressEvent<FileReader>) => reject(progressEvent);
			fileReader.onload = (progressEvent: ProgressEvent<FileReader>) => {
				const imageElement: HTMLImageElement = new Image();

				imageElement.src = String(progressEvent.target.result);
				imageElement.onerror = (event: string | Event) => reject(event);
				imageElement.onload = (): void => {
					const requiredWidth: number = 512;
					const requiredHeight: number = 512;

					const validWidth: boolean = imageElement.width >= requiredWidth;
					const validHeight: boolean = imageElement.height >= requiredHeight;

					const ipaOperation: IPAOperation = {
						operation: 'extend',
						background: 'transparent'
					};

					if (!validWidth) {
						const extend: number = (requiredWidth - imageElement.width) / 2;

						ipaOperation.left = extend;
						ipaOperation.right = extend;
					}

					if (!validHeight) {
						const extend: number = (requiredHeight - imageElement.height) / 2;

						ipaOperation.top = extend;
						ipaOperation.bottom = extend;
					}

					/** If Width or Height less than 512px then extend it to 512px */

					if (!validWidth || !validHeight) {
						resolve(ipaOperation);
					} else {
						resolve(null);
					}
				};
			};

			fileReader.readAsDataURL(file);
		});
	}

	/** REST */

	create(file: File, filePath: string): Observable<string> {
		// prettier-ignore
		const ipaStorageBucket: firebase.storage.Storage = this.angularFireStorage.storage.app.storage(environment.ipaStorageBucket);

		return from(ipaStorageBucket.ref(filePath).put(file)).pipe(
			switchMap(() => of(ipaStorageBucket.ref(filePath).fullPath)),
			catchError((httpError: any) => {
				return this.apiService.setError(httpError, 'Unable to upload image');
			})
		);
	}

	getOne(IPAOperationParams: IPAOperation[]): Observable<File> {
		return this.httpClient
			.get(environment.ipaUrl.concat(this.getParams(IPAOperationParams)), {
				responseType: 'blob'
			})
			.pipe(
				map((blob: Blob) => this.fileService.getFileFromBlob(blob)),
				catchError((httpError: any) => {
					// prettier-ignore
					return this.apiService.setError(httpError, 'The file returned from url does not seem to be a valid image type');
				})
			);
	}
}
