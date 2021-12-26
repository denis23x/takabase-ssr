/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { iif, Observable, of, throwError, zip } from 'rxjs';
import { catchError, first, mergeMap, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AuthService,
  CategoryGetAllDto,
  CategoryService,
  Post,
  PostGetOneDto,
  PostService,
  User
} from '../core';

@Injectable({
  providedIn: 'root'
})
export class MarkdownResolverService {
  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private postService: PostService,
    private router: Router
  ) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<any> {
    return this.authService.userSubject.pipe(
      first(),
      switchMap((user: User) => {
        const categoryGetAllDto: CategoryGetAllDto = {
          userId: user.id
        };

        return zip(of(user), this.categoryService.getAll(categoryGetAllDto));
      }),
      mergeMap(([user, categoryList]) => {
        const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));
        const postGetOneDto: PostGetOneDto = {
          scope: ['user', 'category']
        };

        return iif(
          () => !!postId,
          zip(
            of(user),
            of(categoryList),
            this.postService.getOne(postId, postGetOneDto).pipe(
              switchMap((post: Post) => {
                if (user.id !== post.user.id) {
                  const error: any = {
                    status: 404,
                    message: 'Not found'
                  };

                  this.router
                    .navigate(['/exception', error.status])
                    .then(() => console.debug('Route was changed'));

                  return throwError(error);
                }

                return of(post);
              })
            )
          ),
          zip(of(user), of(categoryList))
        );
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
