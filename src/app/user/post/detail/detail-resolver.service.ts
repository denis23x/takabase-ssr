/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import {
	PostService,
	Post,
	PostGetOneDto,
	User,
	Category,
	ApiService
} from '../../../core';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class UserPostDetailResolverService {
	constructor(
		private apiService: ApiService,
		private router: Router,
		private postService: PostService
	) {}

	// prettier-ignore
	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post> {
		const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

    if (Number.isNaN(postId)) {
      return this.apiService.setErrorRedirect({
        status: 404,
        error: {
          message: 'Not found'
        }
      });
    }

		const postGetOneDto: PostGetOneDto = {
			scope: ['user', 'category']
		};

		return this.postService.getOne(postId, postGetOneDto).pipe(
			switchMap((post: Post) => {
				const data: [User, Category[]] | undefined =
					activatedRouteSnapshot.parent.parent.data.data;

				if (!!data) {
					// @ts-ignore
					const user: User = [...data].shift();

					if (user.id !== post.user.id) {
            return this.apiService.setErrorRedirect({
              status: 404,
              error: {
                message: 'Not found'
              }
            });
					}
				}

				return of(post);
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
