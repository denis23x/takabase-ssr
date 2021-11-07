/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { PostService, Post } from '../core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostsDetailResolverService {
  constructor(private router: Router, private postService: PostService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post> {
    return this.postService.getOne(Number(activatedRouteSnapshot.paramMap.get('id'))).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
