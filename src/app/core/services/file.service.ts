/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FileCreateDto } from '../dto/file/file-create.dto';
import { FileGetOneDto } from '../dto/file/file-get-one.dto';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	constructor(private apiService: ApiService) {}

	/** Utility */

	getFileValidationMime(file: File, mimeTypes: string[]): boolean {
		return mimeTypes.includes(file.type);
	}

	getFileValidationSize(file: File, size: number): boolean {
		return file.size <= 1000000 * size;
	}

	/** REST */

	create(formData: FormData): Observable<FileCreateDto> {
		return this.apiService.post('/files/image', formData);
	}

	getOne(fileGetOneDto: FileGetOneDto): Observable<File> {
		return this.apiService.get('/files/image/proxy', fileGetOneDto, {
			responseType: 'blob'
		});
	}
}
