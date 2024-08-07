/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { Post } from '../models/post.model';
import type { PostBookmarkCreateDto } from '../dto/post-bookmark/post-bookmark-create.dto';
import type { PostBookmarkGetAllDto } from '../dto/post-bookmark/post-bookmark-get-all.dto';
import type { PostBookmarkGetOneDto } from '../dto/post-bookmark/post-bookmark-get-one.dto';
import type { PostBookmarkUpdateDto } from '../dto/post-bookmark/post-bookmark-update.dto';

@Injectable()
export class PostBookmarkService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postBookmarkCreateDto: PostBookmarkCreateDto): Observable<Post> {
		return this.apiService.post('/v1/posts-bookmark', postBookmarkCreateDto);
	}

	getAll(postBookmarkGetAllDto: PostBookmarkGetAllDto): Observable<Post[]> {
		return this.apiService.get('/v1/posts-bookmark', postBookmarkGetAllDto);
	}

	getOne(postId: number, postBookmarkGetOneDto: PostBookmarkGetOneDto): Observable<Post> {
		return this.apiService.get('/v1/posts-bookmark/' + postId, postBookmarkGetOneDto);
	}

	update(postId: number, postBookmarkUpdateDto: PostBookmarkUpdateDto): Observable<Post> {
		return this.apiService.put('/v1/posts-bookmark/' + postId, postBookmarkUpdateDto);
	}

	delete(postId: number): Observable<Partial<Post>> {
		return this.apiService.delete('/v1/posts-bookmark/' + postId);
	}
}
