/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AuthService,
  CategoryGetAllDto,
  CategoryService,
  PostEdit,
  PostGetOneDto,
  PostService,
  User
} from '../core';

@Injectable({
  providedIn: 'root'
})
export class EditResolverService {
  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private postService: PostService,
    private router: Router
  ) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<PostEdit> {
    return this.authService.userSubject.pipe(
      first(),
      switchMap((user: User) => {
        const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

        const postGetOneDto: PostGetOneDto = {
          scope: ['user', 'category']
        };

        return zip(of(user), this.postService.getOne(postId, postGetOneDto));
      }),
      switchMap(([user, post]) => {
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

        const categoryGetAllDto: CategoryGetAllDto = {
          userId: user.id
        };

        return zip(of(post), this.categoryService.getAll(categoryGetAllDto));
      }),
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      }),
      map(([post, categoryList]) => ({ post, categoryList }))
    );
  }
}
