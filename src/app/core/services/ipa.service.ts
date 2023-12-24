/** @format */

import { Injectable } from '@angular/core';
import { from, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IPAOperation } from '../dto/ipa/ipa-operation.dto';
import { FileService } from './file.service';
import firebase from 'firebase/compat';

@Injectable({
	providedIn: 'root'
})
export class IPAService {
	constructor(
		private apiService: ApiService,
		private httpClient: HttpClient,
		private fileService: FileService,
		private angularFireStorage: AngularFireStorage
	) {}

	/** Utility */

	getParams(IPAOperationParams: IPAOperation[]): string {
		return '?operations=' + this.getParamsEncode(IPAOperationParams);
	}

	getParamsEncode(IPAOperationParams: IPAOperation[]): string {
		return encodeURIComponent(JSON.stringify(IPAOperationParams));
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
