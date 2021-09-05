/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post, PostService } from '../core';

@Injectable({
  providedIn: 'root'
})
export class SearchResolverService {
  constructor(private postService: PostService) {}

  resolve(): Observable<Post[]> {
    return this.postService.getAll({
      page: 1,
      size: 100
    });
  }
}
