/** @format */

import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
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
import { PostDeleteDto } from '../dto/post/post-delete.dto';

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
		this.metaService.getMetaImageDownloadURL(post.image).subscribe({
			next: (downloadURL: string | null) => {
				this.backupPostMetaOpenGraph = this.metaService.getMetaOpenGraph();
				this.backupPostMetaTwitter = this.metaService.getMetaTwitter();

				/** Set meta (SSR SEO trick) */

				const metaOpenGraph: MetaOpenGraph = {
					['og:title']: post.name,
					['og:description']: post.description,
					['og:type']: 'article',
					['article:published_time']: post.createdAt,
					['article:modified_time']: post.updatedAt,
					['article:author']: this.userService.getUserUrl(post.user, 1),
					['article:section']: post.category.name,
					['og:image']: downloadURL,
					['og:image:alt']: post.name,
					['og:image:type']: 'image/webp'
				};

				const metaTwitter: MetaTwitter = {
					['twitter:title']: post.name,
					['twitter:description']: post.description,
					['twitter:image']: downloadURL,
					['twitter:image:alt']: post.name
				};

				this.metaService.setMeta(metaOpenGraph, metaTwitter);
			},
			error: (error: any) => console.error(error)
		});
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
		return this.apiService.post('/v1/posts', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
		return this.apiService.get('/v1/posts', postGetAllDto);
	}

	getOne(id: number, postGetOneDto: PostGetOneDto): Observable<Post> {
		return this.apiService.get('/v1/posts/' + id, postGetOneDto);
	}

	update(id: number, postUpdateDto: PostUpdateDto): Observable<Post> {
		return this.apiService.put('/v1/posts/' + id, postUpdateDto);
	}

	delete(id: number, postDeleteDto: PostDeleteDto): Observable<Partial<Post>> {
		return this.apiService.delete('/v1/posts/' + id, postDeleteDto);
	}
}
