/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { PostService, Post } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class PostsDetailResolverService {
  constructor(private postService: PostService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Post> {
    return this.postService.getById(Number(route.paramMap.get('id')));
  }
}
