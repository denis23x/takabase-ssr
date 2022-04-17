/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PostService, PostGetAllDto, Post } from '../../../../core';
import { HttpErrorResponse } from '@angular/common/http';
import { getPostGetAllDto } from './category.component';

@Injectable({
  providedIn: 'root'
})
export class CategoryDetailResolverService {
  constructor(private postService: PostService, private router: Router) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post[]> {
    let postGetAllDto: PostGetAllDto = {
      page: 1,
      size: 10,
      scope: ['user', 'category']
    };

    postGetAllDto = {
      ...getPostGetAllDto(postGetAllDto, activatedRouteSnapshot)
    };

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
