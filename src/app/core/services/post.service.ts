/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { ApiService } from './api.service';
import { SnackbarService } from './snackbar.service';
import { UserService } from './user.service';
import { PostGetAllDto } from '../dto/post/post-get-all.dto';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { Post } from '../models/post.model';
import { MetaOpenGraph, MetaTwitter } from '../models/meta.model';
import { PostCreateDto } from '../dto/post/post-create.dto';
import { PostGetOneDto } from '../dto/post/post-get-one.dto';
import { PostUpdateDto } from '../dto/post/post-update.dto';
import { MetaService } from './meta.service';

@Injectable({
	providedIn: 'root'
})
export class PostService {
	constructor(
		private apiService: ApiService,
		private router: Router,
		private snackbarService: SnackbarService,
		private userService: UserService,
		private metaService: MetaService
	) {}

	// prettier-ignore
	getUserPostGetAllDto(postGetAllDto: PostGetAllDto, activatedRouteSnapshot: ActivatedRouteSnapshot): PostGetAllDto {
		const [user, categoryList]: [User, Category[]] = activatedRouteSnapshot.parent.data.data;

		postGetAllDto = {
			...postGetAllDto,
			userId: user.id
		};

		const categoryId: number = Number(activatedRouteSnapshot.paramMap.get('categoryId'));

    if (Number.isNaN(categoryId)) {
      this.apiService.setErrorRedirect({
        status: 404,
        error: {
          message: 'Not found'
        }
      })
    }

		if (categoryId) {
			const category: Category | undefined = categoryList.find((category: Category) => category.id === categoryId);

			if (category) {
				postGetAllDto = {
					...postGetAllDto,
					categoryId
				};
			} else {
        this.apiService.setErrorRedirect({
          status: 404,
          error: {
            message: 'Not found'
          }
        })
			}
		}

		return postGetAllDto;
	}

	// prettier-ignore
	getSearchPostGetAllDto(postGetAllDto: PostGetAllDto, activatedRouteSnapshot: ActivatedRouteSnapshot): PostGetAllDto {
    const name: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

    if (!!name.length) {
      postGetAllDto = {
        ...postGetAllDto,
        name
      };
    }

    return postGetAllDto;
  }

	getPostMeta(post: Post): any {
		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: post.name,
			['og:description']: post.description,
			['og:type']: 'article',
			['article:published_time']: post.createdAt,
			['article:modified_time']: post.updatedAt,
			['article:author']: this.userService.getUserUrl(post.user).substring(1),
			['article:section']: post.category.name,
			['og:image']: post.image,
			['og:image:alt']: post.name,
			['og:image:type']: 'image/png'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: post.name,
			['twitter:description']: post.description,
			['twitter:image']: post.image,
			['twitter:image:alt']: post.name
		};

		return {
			metaOpenGraph,
			metaTwitter
		};
	}

	setPostMeta(post: Post): void {
		const postMeta: any = this.getPostMeta(post);

		const metaOpenGraph: MetaOpenGraph = postMeta.metaOpenGraph;
		const metaTwitter: MetaTwitter = postMeta.metaTwitter;

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}

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
