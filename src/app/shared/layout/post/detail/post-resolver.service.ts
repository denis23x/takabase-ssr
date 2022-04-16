/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { PostService, Post, User, PostGetOneDto, Category } from '../../../../core';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostDetailResolverService {
  constructor(private router: Router, private postService: PostService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post> {
    const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

    const postGetOneDto: PostGetOneDto = {
      scope: ['user']
    };

    return this.postService.getOne(postId, postGetOneDto).pipe(
      switchMap((post: Post) => {
        const data: [User, Category[]] | undefined = activatedRouteSnapshot.parent.parent.data.data;

        if (!!data) {
          // @ts-ignore
          const user: User = [...data].shift();

          if (user.id !== post.user.id) {
            return throwError({
              status: 403,
              message: 'Forbidden'
            });
          }
        }

        return of(post);
      }),
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
