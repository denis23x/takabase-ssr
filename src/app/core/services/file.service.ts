/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { FileCreateDto, FileGetOneDto } from '../dto';

@Injectable({
	providedIn: 'root'
})
export class FileService {
	constructor(private apiService: ApiService) {}

	create(formData: FormData): Observable<FileCreateDto> {
		return this.apiService.post('/files', formData);
	}

	getOne(fileGetOneDto: FileGetOneDto): Observable<File> {
		return this.apiService.get('/files', fileGetOneDto, {
			responseType: 'blob'
		});
	}
}
