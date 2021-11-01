/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, first, map, pluck, switchMap } from 'rxjs/operators';
import { UserService, UserProfile, User } from '../core';
import { HttpErrorResponse } from '@angular/common/http';
import { PostService, PostGetAllDto } from '../../post/core';
import { AuthService } from '../../auth/core';
import { CategoryService } from '../../category/core';

@Injectable({
  providedIn: 'root'
})
export class UsersProfileResolverService {
  page = 1;
  size = 10;

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<UserProfile> {
    return this.userService.getProfile().pipe(
      switchMap((user: User) => zip(of(user), this.categoryService.getAll({ userId: user.id }))),
      switchMap(([user, categoryList]) => {
        let postGetAllDto: PostGetAllDto = {
          userId: user.id,
          page: this.page,
          size: this.size,
          scope: ['user']
        };

        const { categoryId = null } = route.parent.queryParams;

        if (categoryId) {
          postGetAllDto = {
            ...postGetAllDto,
            categoryId
          };
        }

        return zip(of(user), of(categoryList), this.postService.getAll(postGetAllDto));
      }),
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      }),
      map(([user, categoryList, postList]) => ({ user, categoryList, postList }))
    );
  }
}
