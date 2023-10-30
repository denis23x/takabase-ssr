/** @format */

import { Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { FileGetOneDto } from '../dto/file/file-get-one.dto';
import { FileGetOneProxyDto } from '../dto/file/file-get-one-proxy.dto';
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

	getFileValidationMime(file: File, mimeTypes: string[]): boolean {
		return mimeTypes.includes(file.type);
	}

	getFileValidationSize(file: File, size: number): boolean {
		return file.size <= 1000000 * size;
	}

	/** REST */

	create(file: File, filePath: string): Observable<string> {
		return from(this.angularFireStorage.upload(filePath, file)).pipe(
			switchMap(() => this.angularFireStorage.ref(filePath).getDownloadURL()),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	getOne(fileGetOneDto: FileGetOneDto): Observable<Blob> {
		return this.apiService.get('/files/image', fileGetOneDto, {
			responseType: 'blob'
		});
	}

	getOneProxy(fileGetOneProxyDto: FileGetOneProxyDto): Observable<Blob> {
		return this.apiService.get('/files/image/proxy', fileGetOneProxyDto, {
			responseType: 'blob'
		});
	}

	delete(filePath: string): Observable<any> {
		return this.angularFireStorage.refFromURL(filePath).delete();
	}
}
