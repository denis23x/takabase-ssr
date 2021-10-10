/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models';

@Injectable()
export class CategoryService {
  constructor(private apiService: ApiService) {}

  postCreate(body: any): Observable<Category> {
    return this.apiService.post('/categories', body);
  }

  getAll(params?: any): Observable<Category[]> {
    return this.apiService.get('/categories', params);
  }
}
