/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot } from '@angular/router';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { PostGetAllDto } from '../dto/post/post-get-all.dto';
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
		private userService: UserService,
		private metaService: MetaService,
		private titleService: TitleService
	) {}

	/** Resolvers DTO */

	// prettier-ignore
	getSearchPostGetAllDto(postGetAllDto: PostGetAllDto, activatedRouteSnapshot: ActivatedRouteSnapshot): PostGetAllDto {
    const query: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

    if (query.length) {
      postGetAllDto = {
        ...postGetAllDto,
        query
      };
    }

    const orderBy: string = String(activatedRouteSnapshot.parent.queryParamMap.get('orderBy') || '');

    if (orderBy.length) {
      postGetAllDto = {
        ...postGetAllDto,
        orderBy
      };
    }

    return postGetAllDto;
  }

	/** SEO Meta tags */

	setPostMetaTags(post: Post): void {
		this.backupPostMetaOpenGraph = this.metaService.getMetaOpenGraph();
		this.backupPostMetaTwitter = this.metaService.getMetaTwitter();

		/** Set new meta */

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: post.name,
			['og:description']: post.description,
			['og:type']: 'article',
			['article:published_time']: post.createdAt,
			['article:modified_time']: post.updatedAt,
			['article:author']: this.userService.getUserUrl(post.user, 1),
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

	removePostMeta(): void {
		// prettier-ignore
		this.metaService.setMeta(this.backupPostMetaOpenGraph, this.backupPostMetaTwitter);
	}

	/** SEO Title */

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
