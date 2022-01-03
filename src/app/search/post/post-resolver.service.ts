/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { PostService, Post, PostGetAllDto } from '../../core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchPostResolverService {
  constructor(private router: Router, private postService: PostService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post[]> {
    let postGetAllDto: PostGetAllDto = {
      page: 1,
      size: 10,
      scope: ['user', 'category']
    };

    const title: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

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
