/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { combineLatest, EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, first, mergeMap, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, Post, PostGetOneDto, PostService, User } from '../core';

@Injectable({
  providedIn: 'root'
})
export class MarkdownResolverService {
  constructor(
    private authService: AuthService,
    private postService: PostService,
    private router: Router
  ) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post> {
    const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

    if (postId) {
      const postUser$ = this.authService.userSubject.pipe(first());
      const postGetOneDto: PostGetOneDto = {
        scope: ['user', 'category']
      };

      return this.postService.getOne(postId, postGetOneDto).pipe(
        mergeMap((post: Post) => combineLatest([of(post), postUser$])),
        switchMap(([post, user]: [Post, User]) => {
          if (user.id !== post.user.id) {
            return throwError(() => {
              return {
                status: 403,
                message: 'Forbidden'
              };
            });
          }

          return of(post);
        }),
        catchError((httpErrorResponse: HttpErrorResponse) => {
          this.router
            .navigate(['/exception', httpErrorResponse.status])
            .then(() => console.debug('Route changed'));

          return throwError(() => httpErrorResponse);
        })
      );
    }

    return EMPTY;
  }
}
