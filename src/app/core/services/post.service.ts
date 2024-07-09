/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PostGetAllDto } from '../dto/post/post-get-all.dto';
import { Post } from '../models/post.model';
import { MetaOpenGraph, MetaTwitter } from '../models/meta.model';
import { PostCreateDto } from '../dto/post/post-create.dto';
import { PostGetOneDto } from '../dto/post/post-get-one.dto';
import { PostUpdateDto } from '../dto/post/post-update.dto';
import { MetaService } from './meta.service';
import { TitleService } from './title.service';
import { PostDeleteDto } from '../dto/post/post-delete.dto';
import { Navigation, Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class PostService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly router: Router = inject(Router);

	backupPostMetaOpenGraph: MetaOpenGraph;
	backupPostMetaTwitter: MetaTwitter;

	backupPostTitle: string;

	/** SPA helper */

	removePost(postList: Post[]): Post[] {
		const navigation: Navigation | null = this.router.getCurrentNavigation();

		if (navigation?.extras?.state?.action === 'post-delete') {
			return postList.filter((post: Post) => post.id !== navigation.extras.state.data.id);
		}

		return postList;
	}

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
					['article:author']: post.user.name,
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
