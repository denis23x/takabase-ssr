/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { Post } from '../models/post.model';
import type { PostCreateDto } from '../dto/post/post-create.dto';
import type { PostDeleteDto } from '../dto/post/post-delete.dto';
import type { PostGetOneDto } from '../dto/post/post-get-one.dto';
import type { PostGetAllDto } from '../dto/post/post-get-all.dto';
import type { PostUpdateDto } from '../dto/post/post-update.dto';

@Injectable()
export class PostBookmarkService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<Post> {
		return this.apiService.post('/v1/posts-bookmark', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
		return this.apiService.get('/v1/posts-bookmark', postGetAllDto);
	}

	getOne(postId: number, postGetOneDto?: PostGetOneDto): Observable<Post> {
		return this.apiService.get('/v1/posts-bookmark/' + postId, postGetOneDto);
	}

	update(postId: number, postUpdateDto: PostUpdateDto): Observable<Post> {
		return this.apiService.put('/v1/posts-bookmark/' + postId, postUpdateDto);
	}

	delete(postDeleteDto: PostDeleteDto): Observable<Partial<Post>> {
		return this.apiService.delete('/v1/posts-bookmark', postDeleteDto);
	}
}
