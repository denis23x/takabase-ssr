/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CategoryCreateDto } from '../dto/category/category-create.dto';
import { CategoryGetAllDto } from '../dto/category/category-get-all.dto';
import { Category } from '../models/category.model';
import { CategoryUpdateDto } from '../dto/category/category-update.dto';
import { CategoryDeleteDto } from '../dto/category/category-delete.dto';
import { CategoryGetOneDto } from '../dto/category/category-get-one.dto';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	constructor(private apiService: ApiService) {}

	/** Resolvers DTO */

	// prettier-ignore
	getSearchCategoryGetAllDto(categoryGetAllDto: CategoryGetAllDto, activatedRouteSnapshot: ActivatedRouteSnapshot): CategoryGetAllDto {
    const query: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

    if (query.length) {
      categoryGetAllDto = {
        ...categoryGetAllDto,
        query
      };
    }

    const orderBy: string = String(activatedRouteSnapshot.parent.queryParamMap.get('orderBy') || '');

    if (orderBy.length) {
      categoryGetAllDto = {
        ...categoryGetAllDto,
        orderBy
      };
    }

    return categoryGetAllDto;
  }

	/** REST */

	create(categoryCreateDto: CategoryCreateDto): Observable<Category> {
		return this.apiService.post('/categories', categoryCreateDto);
	}

	getAll(categoryGetAllDto: CategoryGetAllDto): Observable<Category[]> {
		return this.apiService.get('/categories', categoryGetAllDto);
	}

	// prettier-ignore
	getOne(id: number, categoryGetOneDto: CategoryGetOneDto): Observable<Category> {
		return this.apiService.get('/categories/' + id, categoryGetOneDto);
	}

	// prettier-ignore
	update(id: number, categoryUpdateDto: CategoryUpdateDto): Observable<Category> {
		return this.apiService.put('/categories/' + id, categoryUpdateDto);
	}

	// prettier-ignore
	delete(id: number, categoryDeleteDto: CategoryDeleteDto): Observable<Category> {
		return this.apiService.delete('/categories/' + id, categoryDeleteDto);
	}
}
