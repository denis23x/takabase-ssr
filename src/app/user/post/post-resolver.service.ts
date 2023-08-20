/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';

@Injectable({
	providedIn: 'root'
})
export class UserPostResolverService {
	constructor(
		private postService: PostService,
		private router: Router
	) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Post[]> {
		let postGetAllDto: PostGetAllDto = {
			page: 1,
			size: 20
		};

		// prettier-ignore
		postGetAllDto = {
			...this.postService.getUserPostGetAllDto(postGetAllDto, activatedRouteSnapshot)
		};

		return this.postService.getAll(postGetAllDto).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
