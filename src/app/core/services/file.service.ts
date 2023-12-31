/** @format */

import { Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	constructor(
		private apiService: ApiService,
		private angularFireStorage: AngularFireStorage
	) {}

	/** Utility */

	getFileFromBlob(blob: Blob, fileName: string): File {
		return new File([blob], fileName, {
			type: blob.type
		});
	}

	getFileValidationMime(file: File, mimeTypes: string[]): boolean {
		return mimeTypes.includes(file.type);
	}

	getFileValidationSize(file: File, size: number): boolean {
		return file.size <= 1048576 * size;
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
