/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserService, UserProfile } from '../core';
import { HttpErrorResponse } from '@angular/common/http';
import { PostService, PostGetAllDto } from '../../post/core';
import { CategoryService } from '../../category/core';

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

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<UserProfile> {
    return of(Number(activatedRouteSnapshot.paramMap.get('id'))).pipe(
      switchMap((userId: number) =>
        zip(this.userService.getOne(userId), this.categoryService.getAll({ userId }))
      ),
      switchMap(([user, categoryList]) => {
        let postGetAllDto: PostGetAllDto = {
          userId: user.id,
          page: this.page,
          size: this.size,
          scope: ['user']
        };

        const { categoryId = null } = activatedRouteSnapshot.parent.queryParams;

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
