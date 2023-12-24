/** @format */

import { Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { HelperService } from './helper.service';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	constructor(
		private apiService: ApiService,
		private helperService: HelperService,
		private angularFireStorage: AngularFireStorage
	) {}

	/** Utility */

	getFileFromBlob(blob: Blob): File {
		return new File([blob], this.helperService.getUUID(), {
			type: blob.type
		});
	}

	getFileSizeFormat(bytes: number, decimals: number = 2): string {
		if (!+bytes) {
			return '0 Bytes';
		}

		const k: number = 1024;
		const dm: number = decimals < 0 ? 0 : decimals;
		const sizeList: string[] = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

		const i: number = Math.floor(Math.log(bytes) / Math.log(k));

		const size: string = String(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)));

		return `${size} ${sizeList[i]}`;
	}

	getFileValidationMime(file: File, mimeTypes: string[]): boolean {
		return mimeTypes.includes(file.type);
	}

	getFileValidationSize(file: File, size: number): boolean {
		return file.size <= 1000000 * size;
	}

	/** REST */

	create(file: File, filePath: string): Observable<string> {
		return from(this.angularFireStorage.upload(filePath, file)).pipe(
			switchMap(() => {
				return this.angularFireStorage.ref(filePath).updateMetadata({
					cacheControl: 'public, max-age=31536000, immutable',
					contentType: file.type
				});
			}),
			switchMap(() => this.angularFireStorage.ref(filePath).getDownloadURL()),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	delete(filePath: string): Observable<any> {
		return this.angularFireStorage.refFromURL(filePath).delete();
	}
}
