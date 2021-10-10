/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core';
import { Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private apiService: ApiService) {}

  create(body: any): Observable<Category> {
    return this.apiService.post('/categories', body);
  }

  findAll(params?: any): Observable<Category[]> {
    return this.apiService.get('/categories', params);
  }
}
