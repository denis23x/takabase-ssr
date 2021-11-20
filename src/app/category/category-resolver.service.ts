/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PostService, PostGetAllDto, Post, UserProfile } from '../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryResolverService {
  constructor(private postService: PostService, private router: Router) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post[]> {
    const userProfile = activatedRouteSnapshot.parent.data.data as UserProfile;

    let postGetAllDto: PostGetAllDto = {
      page: 1,
      size: 10,
      userId: userProfile.user.id,
      scope: ['user']
    };

    const categoryId = Number(activatedRouteSnapshot.paramMap.get('categoryId'));

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
