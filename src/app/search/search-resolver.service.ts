/** @format */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Post, PostService } from '../core';

@Injectable({
  providedIn: 'root'
})
export class SearchResolverService {
  constructor(private router: Router, private postService: PostService) {}

  resolve(): Observable<Post[]> {
    return this.postService.getAll({
      page: 1,
      size: 100
    });
  }
}
