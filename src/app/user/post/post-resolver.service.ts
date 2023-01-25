/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PostService, PostGetAllDto, Post } from '../../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class UserPostResolverService {
	constructor(private postService: PostService, private router: Router) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post[]> {
		let postGetAllDto: PostGetAllDto = {
			page: 1,
			size: 20,
			scope: ['user', 'category']
		};

		// prettier-ignore
		postGetAllDto = {
			...this.postService.getUserPostGetAllDto(postGetAllDto, activatedRouteSnapshot)
		};

		return this.postService.getAll(postGetAllDto).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/exception', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
