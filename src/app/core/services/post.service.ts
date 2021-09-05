/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Post } from '../models';
import { environment } from '../../../environments/environment';

@Injectable()
export class PostService {
  constructor(private apiService: ApiService) {}

  getAll(params?: any): Observable<Post[]> {
    return this.apiService.get('/posts', params).pipe(
      map((postList: Post[]) =>
        postList.map((post: Post) => ({
          ...post,
          image: post.image ? `${environment.UPLOAD_URL}/${post.image}` : null,
          user: {
            ...post.user,
            avatar: post.user.avatar ? `${environment.UPLOAD_URL}/${post.user.avatar}` : null
          }
        }))
      )
    );
  }

  getById(id: number): Observable<Post> {
    return this.apiService.get('/posts/' + id);
  }
}
