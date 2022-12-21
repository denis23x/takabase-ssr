/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import {
	AuthService,
	Category,
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

	// prettier-ignore
	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<(Category[] | Post)[]> {
		const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

		return this.authService.user.pipe(first()).pipe(
			switchMap((user: User) => {
				const categoryList$ = (): Observable<Category[]> => {
					const categoryGetAllDto: CategoryGetAllDto = {
						page: 1,
						size: 999,
						userId: user.id
					};

					return this.categoryService.getAll(categoryGetAllDto);
				};

				const post$ = (): Observable<Post> => {
					const postGetOneDto: PostGetOneDto = {
						scope: ['user', 'category']
					};

					return this.postService.getOne(postId, postGetOneDto).pipe(
						switchMap((post: Post) => {
							if (user.id !== post.user.id) {
								return throwError(() => {
									return {
										status: 403,
										message: 'Forbidden'
									};
								});
							}

							return of(post);
						})
					);
				};

				const forkJoin$ = (): Observable<Category[] | Post>[] => {
					if (!!postId) {
						return [categoryList$(), post$()];
					} else {
						return [categoryList$()];
					}
				};

				return forkJoin(forkJoin$());
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
