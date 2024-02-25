/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError, map } from 'rxjs/operators';
import { HelperService } from './helper.service';
import { FirebaseError } from '@angular/fire/app';
import mime from 'mime';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly angularFireStorage: AngularFireStorage = inject(AngularFireStorage);

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
			map((fileUrl: string) => {
				/** Remove access token and extra query params */

				const url: URL = new URL(fileUrl);
				const urlNew: string = fileUrl.replace(url.search, '');

				return urlNew;
			}),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	delete(filePath: string): Observable<any> {
		return this.angularFireStorage.refFromURL(filePath).delete();
	}
}
