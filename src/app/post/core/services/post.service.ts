/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core';
import { Post } from '../models';

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

  getOne(id: number): Observable<Post> {
    return this.apiService.get('/posts/' + id);
  }
}
