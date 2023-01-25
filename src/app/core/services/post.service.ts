/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, SnackbarService } from '../services';
import { Category, Post, User } from '../models';
import {
	PostCreateDto,
	PostGetAllDto,
	PostGetOneDto,
	PostUpdateDto
} from '../dto';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class PostService {
	constructor(
		private apiService: ApiService,
		private router: Router,
		private snackbarService: SnackbarService
	) {}

	// prettier-ignore
	getUserPostGetAllDto = (postGetAllDto: PostGetAllDto, activatedRouteSnapshot: ActivatedRouteSnapshot): PostGetAllDto => {
		const [user, categoryList]: [User, Category[]] = activatedRouteSnapshot.parent.data.data;

		postGetAllDto = {
			...postGetAllDto,
			userId: user.id
		};

		const categoryId: number = Number(activatedRouteSnapshot.paramMap.get('categoryId'));

		if (categoryId) {
			const category: Category | undefined = categoryList.find((category: Category) => category.id === categoryId);

			if (category) {
				postGetAllDto = {
					...postGetAllDto,
					categoryId
				};
			} else {
				this.router
					.navigate(['/exception', 404])
					.then(() => this.snackbarService.danger('Error', 'Not found'));
			}
		}

		return postGetAllDto;
	};

	// prettier-ignore
	getSearchPostGetAllDto = (postGetAllDto: PostGetAllDto, activatedRouteSnapshot: ActivatedRouteSnapshot): PostGetAllDto => {
    const name: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

    if (!!name.length) {
      postGetAllDto = {
        ...postGetAllDto,
        name
      };
    }

    return postGetAllDto;
  };

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<Post> {
		return this.apiService.post('/posts', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
		return this.apiService.get('/posts', postGetAllDto);
	}

	getOne(id: number, postGetOneDto?: PostGetOneDto): Observable<Post> {
		return this.apiService.get('/posts/' + id, postGetOneDto);
	}

	update(id: number, postUpdateDto: PostUpdateDto): Observable<Post> {
		return this.apiService.put('/posts/' + id, postUpdateDto);
	}

	delete(id: number): Observable<Post> {
		return this.apiService.delete('/posts/' + id);
	}
}
