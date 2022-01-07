/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { Category } from '../models';
import { CategoryCreateOneDto, CategoryGetAllDto, CategoryUpdateOneDto } from '../dto';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private apiService: ApiService) {}

  createOne(categoryCreateOneDto: CategoryCreateOneDto): Observable<Category> {
    return this.apiService.post('/categories', { ...categoryCreateOneDto });
  }

  getAll(categoryGetAllDto: CategoryGetAllDto): Observable<Category[]> {
    return this.apiService.get('/categories', { ...categoryGetAllDto });
  }

  getOne(id: number): Observable<Category> {
    return this.apiService.get('/categories/' + id);
  }

  updateOne(id: number, categoryUpdateOneDto: CategoryUpdateOneDto): Observable<Category> {
    return this.apiService.put('/categories/' + id, { ...categoryUpdateOneDto });
  }

  deleteOne(id: number): Observable<Category> {
    return this.apiService.delete('/categories/' + id);
  }
}
