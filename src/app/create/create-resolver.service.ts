/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../core/services/api.service';
import { AuthorizationService } from '../core/services/authorization.service';
import { CategoryService } from '../core/services/category.service';
import { PostService } from '../core/services/post.service';
import { Category } from '../core/models/category.model';
import { Post } from '../core/models/post.model';
import { CategoryGetAllDto } from '../core/dto/category/category-get-all.dto';
import { PostGetOneDto } from '../core/dto/post/post-get-one.dto';
import { CurrentUser } from '../core/models/current-user.model';

@Injectable({
	providedIn: 'root'
})
export class CreateResolverService {
	constructor(
		private apiService: ApiService,
		private authorizationService: AuthorizationService,
		private categoryService: CategoryService,
		private postService: PostService,
		private router: Router
	) {}

	// prettier-ignore
	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<(Category[] | Post)[]> {
		const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

    if (Number.isNaN(postId)) {
      return this.apiService.setErrorRedirect({
        status: 404,
        error: {
          message: 'Not found'
        }
      });
    }

    return this.authorizationService.getCurrentUser().pipe(
      first(),
			switchMap((currentUser: CurrentUser) => {
				const categoryList$ = (): Observable<Category[]> => {
					const categoryGetAllDto: CategoryGetAllDto = {
						page: 1,
						size: 999,
						userId: currentUser.id
					};

					return this.categoryService.getAll(categoryGetAllDto);
				};

				const post$ = (): Observable<Post> => {
					const postGetOneDto: PostGetOneDto = {
						scope: ['user', 'category']
					};

					return this.postService.getOne(postId, postGetOneDto).pipe(
						switchMap((post: Post) => {
							if (currentUser.id !== post.user.id) {
                return this.apiService.setErrorRedirect({
                  status: 404,
                  error: {
                    message: 'Not found'
                  }
                });
							}

							return of(post);
						})
					);
				};

				const observable$ = (): Observable<Category[] | Post>[] => {
					if (postId) {
						return [categoryList$(), post$()];
					} else {
						return [categoryList$()];
					}
				};

				return forkJoin(observable$());
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
