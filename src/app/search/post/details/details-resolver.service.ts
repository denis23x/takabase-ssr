/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';
import { PostGetOneDto } from '../../../core/dto/post/post-get-one.dto';

@Injectable({
	providedIn: 'root'
})
export class SearchPostDetailsResolverService {
	constructor(
		private apiService: ApiService,
		private router: Router,
		private postService: PostService
	) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post> {
		// prettier-ignore
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
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
