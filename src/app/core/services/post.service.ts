/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
	private readonly apiService: ApiService = inject(ApiService);
	private readonly userService: UserService = inject(UserService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);

	backupPostMetaOpenGraph: MetaOpenGraph;
	backupPostMetaTwitter: MetaTwitter;

	backupPostTitle: string;

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
		this.metaService.setMeta(this.backupPostMetaOpenGraph, this.backupPostMetaTwitter);
	}

	/** SEO Title */

	setPostTitle(title: string): void {
		this.backupPostTitle = this.titleService.getTitle();

		this.titleService.setTitle(title);
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
