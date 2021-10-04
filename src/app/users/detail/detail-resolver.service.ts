/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { defer, Observable, of, throwError, zip } from 'rxjs';
import { catchError, first, map, pluck, switchMap } from 'rxjs/operators';
import { UserService, PostService, CategoryService, UserProfile, PostGetAllDto } from '../../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsersDetailResolverService {
  page = 1;
  size = 10;

  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private postService: PostService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<UserProfile> {
    return defer(() => {
      return route.data.isProfile
        ? this.userService.user.pipe(first(), pluck('id'))
        : of(Number(route.paramMap.get('id')));
    }).pipe(
      switchMap((userId: number) =>
        zip(this.userService.getById(userId), this.categoryService.getAll({ userId }))
      ),
      switchMap(([user, categoryList]) => {
        let postGetAllDto: PostGetAllDto = {
          userId: user.id,
          page: this.page,
          size: this.size
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
