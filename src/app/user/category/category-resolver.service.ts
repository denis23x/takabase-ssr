/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PostService, PostGetAllDto, Post, UserProfile, User } from '../../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserCategoryResolverService {
  constructor(private postService: PostService, private router: Router) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post[]> {
    const userProfile: UserProfile = activatedRouteSnapshot.parent.data.data;
    const user: User = userProfile.user;

    let postGetAllDto: PostGetAllDto = {
      page: 1,
      size: 10,
      userId: user.id,
      scope: ['user', 'category']
    };

    const categoryId: number = Number(activatedRouteSnapshot.paramMap.get('categoryId'));

    if (categoryId) {
      postGetAllDto = {
        ...postGetAllDto,
        categoryId
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
