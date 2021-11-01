/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { PostService, Post, PostGetAllDto } from '../../post/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchPostsResolverService {
  page = 1;
  size = 10;

  constructor(private router: Router, private postService: PostService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Post[]> {
    let postGetAllDto: PostGetAllDto = {
      page: this.page,
      size: this.size,
      scope: ['user']
    };

    const { query: title = null } = route.parent.queryParams;

    if (title) {
      postGetAllDto = {
        ...postGetAllDto,
        title
      };
    }

    return this.postService.getAll(postGetAllDto).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
