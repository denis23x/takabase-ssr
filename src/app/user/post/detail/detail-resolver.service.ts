/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { PostService, Post, UserProfile, User, PostGetOneDto } from '../../../core';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserPostDetailResolverService {
  constructor(private router: Router, private postService: PostService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post> {
    const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

    const postGetOneDto: PostGetOneDto = {
      scope: ['user']
    };

    return this.postService.getOne(postId, postGetOneDto).pipe(
      switchMap((post: Post) => {
        const userProfile: UserProfile = activatedRouteSnapshot.parent.parent.data.data;

        if (userProfile) {
          const user: User = userProfile.user;

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
