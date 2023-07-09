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

	create(formData: FormData): Observable<FileCreateDto> {
		return this.apiService.post('/files', formData);
	}

	getOne(fileGetOneDto: FileGetOneDto): Observable<File> {
		return this.apiService.get('/files/proxy', fileGetOneDto, {
			responseType: 'blob'
		});
	}
}
