/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PostService, Post } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class PostsDetailResolverService {
  constructor(private router: Router, private postService: PostService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Post> {
    return this.postService.getById(Number(route.paramMap.get('id')));
  }
}
