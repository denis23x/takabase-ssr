/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { Category, Post } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private apiService: ApiService) {}

  createOne(body: any): Observable<Post> {
    return this.apiService.post('/posts', body);
  }

  getAll(params: any): Observable<Post[]> {
    return this.apiService.get('/posts', params);
  }

  getOne(id: number, params?: any): Observable<Post> {
    return this.apiService.get('/posts/' + id, params);
  }

  updateOne(id: number, body: any): Observable<Post> {
    return this.apiService.put('/posts/' + id, body);
  }

  deleteOne(id: number): Observable<Post> {
    return this.apiService.delete('/posts/' + id);
  }
}
