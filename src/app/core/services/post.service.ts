/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { Post } from '../models';
import { PostCreateDto, PostGetAllDto, PostGetOneDto, PostUpdateDto } from '../dto';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private apiService: ApiService) {}

  create(postCreateDto: PostCreateDto): Observable<Post> {
    return this.apiService.post('/posts', postCreateDto);
  }

  getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
    return this.apiService.get('/posts', postGetAllDto);
  }

  getOne(id: number, postGetOneDto?: PostGetOneDto): Observable<Post> {
    return this.apiService.get('/posts/' + id, postGetOneDto);
  }

  update(id: number, postUpdateDto: PostUpdateDto): Observable<Post> {
    return this.apiService.put('/posts/' + id, postUpdateDto);
  }

  delete(id: number): Observable<Post> {
    return this.apiService.delete('/posts/' + id);
  }
}
