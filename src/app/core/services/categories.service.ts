/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models';

@Injectable()
export class CategoriesService {
  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<Category[]> {
    return this.apiService.get('/categories', params);
  }

  getById(id: number): Observable<Category> {
    return this.apiService.get('/categories/' + id);
  }
}
