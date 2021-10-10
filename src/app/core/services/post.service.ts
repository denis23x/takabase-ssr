/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Post } from '../models';

@Injectable()
export class PostService {
  constructor(private apiService: ApiService) {}

  findAll(params?: any): Observable<Post[]> {
    return this.apiService.get('/posts', params);
  }

  findOneById(id: number): Observable<Post> {
    return this.apiService.get('/posts/' + id);
  }
}
