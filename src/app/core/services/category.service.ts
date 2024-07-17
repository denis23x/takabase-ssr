/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { Category } from '../models/category.model';
import type { CategoryCreateDto } from '../dto/category/category-create.dto';
import type { CategoryGetAllDto } from '../dto/category/category-get-all.dto';
import type { CategoryUpdateDto } from '../dto/category/category-update.dto';
import type { CategoryDeleteDto } from '../dto/category/category-delete.dto';
import type { CategoryGetOneDto } from '../dto/category/category-get-one.dto';

@Injectable()
export class CategoryService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(categoryCreateDto: CategoryCreateDto): Observable<Category> {
		return this.apiService.post('/v1/categories', categoryCreateDto);
	}

	getAll(categoryGetAllDto: CategoryGetAllDto): Observable<Category[]> {
		return this.apiService.get('/v1/categories', categoryGetAllDto);
	}

	getOne(id: number, categoryGetOneDto?: CategoryGetOneDto): Observable<Category> {
		return this.apiService.get('/v1/categories/' + id, categoryGetOneDto);
	}

	update(id: number, categoryUpdateDto: CategoryUpdateDto): Observable<Category> {
		return this.apiService.put('/v1/categories/' + id, categoryUpdateDto);
	}

	delete(id: number, categoryDeleteDto: CategoryDeleteDto): Observable<Category> {
		return this.apiService.delete('/v1/categories/' + id, categoryDeleteDto);
	}
}
