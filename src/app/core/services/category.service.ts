/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CategoryCreateDto } from '../dto/category/category-create.dto';
import { CategoryGetAllDto } from '../dto/category/category-get-all.dto';
import { Category } from '../models/category.model';
import { CategoryUpdateDto } from '../dto/category/category-update.dto';
import { CategoryDeleteDto } from '../dto/category/category-delete.dto';
import { CategoryGetOneDto } from '../dto/category/category-get-one.dto';

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
