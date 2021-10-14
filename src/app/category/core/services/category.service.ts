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

  getAll(params?: any): Observable<Category[]> {
    return this.apiService.get('/categories', params);
  }

  getOne(id: number): Observable<Category> {
    return this.apiService.get('/categories/' + id);
  }

  edit(id: number, body: any): Observable<Category> {
    return this.apiService.put('/categories/' + id, body);
  }

  delete(id: number): Observable<Category> {
    return this.apiService.delete('/categories/' + id);
  }
}
