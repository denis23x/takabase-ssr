/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../services';
import { Post } from '../models';
import { PostCreateOneDto, PostGetAllDto, PostGetOneDto, PostUpdateOneDto } from '../dto';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private apiService: ApiService) {}

  createOne(postCreateOneDto: PostCreateOneDto): Observable<Post> {
    return this.apiService.post('/posts', { ...postCreateOneDto });
  }

  getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
    return this.apiService.get('/posts', { ...postGetAllDto });
  }

  getOne(id: number, postGetOneDto?: PostGetOneDto): Observable<Post> {
    return this.apiService.get('/posts/' + id, { ...postGetOneDto });
  }

  updateOne(id: number, postUpdateOneDto: PostUpdateOneDto): Observable<Post> {
    return this.apiService.put('/posts/' + id, { ...postUpdateOneDto });
  }

  deleteOne(id: number): Observable<Post> {
    return this.apiService.delete('/posts/' + id);
  }
}
