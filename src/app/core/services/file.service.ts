/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { catchError } from 'rxjs/operators';
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
import { CurrentUser } from '../models/current-user.model';
import { AuthorizationService } from './authorization.service';
import dayjs from 'dayjs/esm';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
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

	/** REST */

	create(file: File, path: string): Observable<string> {
		const currentUser: CurrentUser | undefined = this.authorizationService.currentUser.getValue();

		const fileName: string = this.getFileName(file);
		const filePath: string = ['/users', currentUser.firebase.uid, path, fileName].join('/');

		const storage: FirebaseStorage = this.firebaseService.getStorage();
		const storageRef: StorageReference = ref(storage, filePath);
		const storageRefMetadata: UploadMetadata = {
			cacheControl: 'public, max-age=31536000, immutable',
			contentDisposition: 'attachment; filename=' + fileName,
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

	delete(filePath: string): Observable<void> {
		const storage: FirebaseStorage = this.firebaseService.getStorage();
		const storageRef: StorageReference = ref(storage, filePath);

		return from(deleteObject(storageRef));
	}
}
