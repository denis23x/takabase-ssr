/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import {
	PostService,
	Post,
	PostGetOneDto,
	User,
	Category
} from '../../../core';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class UserPostDetailResolverService {
	constructor(private router: Router, private postService: PostService) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post> {
		// prettier-ignore
		const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

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
						return throwError(() => {
							return {
								status: 403,
								message: 'Forbidden'
							};
						});
					}
				}

				return of(post);
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/exception', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
