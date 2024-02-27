/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators';
import { HelperService } from './helper.service';
import { FirebaseError } from 'firebase/app';
import { FirebaseService } from './firebase.service';
import {
	FirebaseStorage,
	ref,
	StorageReference,
	uploadBytes,
	getDownloadURL,
	deleteObject,
	UploadMetadata
} from 'firebase/storage';
import mime from 'mime';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);

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

		const storage: FirebaseStorage = this.firebaseService.getStorage();
		const storageRef: StorageReference = ref(storage, filePath);
		const storageRefMetadata: UploadMetadata = {
			cacheControl: 'public, max-age=31536000, immutable',
			contentType: file.type
		};

		return from(uploadBytes(storageRef, file, storageRefMetadata)).pipe(
			switchMap(() => getDownloadURL(storageRef)),
			map((fileUrl: string) => {
				/** Remove access token and extra query params */

				const url: URL = new URL(fileUrl);
				const urlNew: string = fileUrl.replace(url.search, '');

				return urlNew;
			}),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	createTemp(file: File): any {
		const storage: FirebaseStorage = this.firebaseService.getStorage('gs://takabase-local-temp');
		const storageFileName: string = this.getFileName(file);
		const storageRef: StorageReference = ref(storage, storageFileName);

		return from(uploadBytes(storageRef, file)).pipe(
			switchMap(() => getDownloadURL(storageRef)),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	delete(filePath: string): Observable<void> {
		const storage: FirebaseStorage = this.firebaseService.getStorage();
		const storageRef: StorageReference = ref(storage, filePath);

		return from(deleteObject(storageRef));
	}
}
