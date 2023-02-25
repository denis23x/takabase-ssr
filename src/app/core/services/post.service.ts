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
import { TitleService } from './title.service';

@Injectable({
	providedIn: 'root'
})
export class PostService {
	backupPostMetaOpenGraph: MetaOpenGraph;
	backupPostMetaTwitter: MetaTwitter;

	backupPostTitle: string;

	constructor(
		private apiService: ApiService,
		private router: Router,
		private snackbarService: SnackbarService,
		private userService: UserService,
		private metaService: MetaService,
		private titleService: TitleService
	) {}

	/** Resolvers DTO */

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

	/** Meta */

	setPostMeta(post: Post): void {
		this.backupPostMetaOpenGraph = this.metaService.getMetaOpenGraph();
		this.backupPostMetaTwitter = this.metaService.getMetaTwitter();

		/** Set new meta */

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

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}

	// prettier-ignore
	removePostMeta(): void {
		this.metaService.setMeta(this.backupPostMetaOpenGraph, this.backupPostMetaTwitter);
	}

	/** Title */

	setPostTitle(title: string): void {
		this.backupPostTitle = this.titleService.getTitle();

		this.titleService.appendTitle(title);
	}

	removePostTitle(): void {
		this.titleService.setTitle(this.backupPostTitle);
	}

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<Post> {
		return this.apiService.post('/posts', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
		return this.apiService.get('/posts', postGetAllDto);
	}

	getOne(id: number, postGetOneDto: PostGetOneDto): Observable<Post> {
		return this.apiService.get('/posts/' + id, postGetOneDto);
	}

	update(id: number, postUpdateDto: PostUpdateDto): Observable<Post> {
		return this.apiService.put('/posts/' + id, postUpdateDto);
	}

	delete(id: number): Observable<Post> {
		return this.apiService.delete('/posts/' + id);
	}
}
