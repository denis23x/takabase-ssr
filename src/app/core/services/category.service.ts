/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { Category } from '../models';
import {
	CategoryCreateDto,
	CategoryGetAllDto,
	CategoryUpdateDto
} from '../dto';

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	constructor(private apiService: ApiService) {}

	create(categoryCreateDto: CategoryCreateDto): Observable<Category> {
		return this.apiService.post('/categories', categoryCreateDto);
	}

	getAll(categoryGetAllDto: CategoryGetAllDto): Observable<Category[]> {
		return this.apiService.get('/categories', categoryGetAllDto);
	}

	getOne(id: number): Observable<Category> {
		return this.apiService.get('/categories/' + id);
	}

	// prettier-ignore
	update(id: number, categoryUpdateDto: CategoryUpdateDto): Observable<Category> {
		return this.apiService.put('/categories/' + id, categoryUpdateDto);
	}

	delete(id: number, denis: any): Observable<Category> {
		return this.apiService.delete('/categories/' + id, denis);
	}
}
