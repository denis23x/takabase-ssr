/** @format */

import { Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { HelperService } from './helper.service';
import mime from 'mime';

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
		const fileName: string = 'image';
		const fileExtension: string = mime.getExtension(blob.type);

		return new File([blob], [fileName, fileExtension].join('.'), {
			type: blob.type
		});
	}

	getFileName(file: File): string {
		const fileDate: number = Date.now();
		const fileUUID: string = this.helperService.getUUID();
		const fileExtension: string = mime.getExtension(file.type);
		const fileName: string = [fileDate, fileUUID].join('-');

		return fileName + '.' + fileExtension;
	}

	getFileValidationMime(file: File, mimeTypes: string[]): boolean {
		return mimeTypes.includes(file.type);
	}

	getFileValidationSize(file: File, size: number): boolean {
		return file.size <= 1048576 * size;
	}

	/** REST */

	create(file: File, path: string): Observable<string> {
		const fileName: string = this.getFileName(file);
		const filePath: string = [path, fileName].join('/');

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
