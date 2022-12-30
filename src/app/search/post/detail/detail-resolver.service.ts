/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { PostService, Post, PostGetOneDto } from '../../../core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class SearchPostDetailResolverService {
	constructor(private router: Router, private postService: PostService) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post> {
		// prettier-ignore
		const postId: number = Number(activatedRouteSnapshot.paramMap.get('postId'));

		const postGetOneDto: PostGetOneDto = {
			scope: ['user', 'category']
		};

		return this.postService.getOne(postId, postGetOneDto).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/exception', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
