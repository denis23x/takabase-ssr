/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { Post } from '../models/post.model';
import type { PostCreateDto } from '../dto/post/post-create.dto';
import type { PostDeleteDto } from '../dto/post/post-delete.dto';
import type { PostGetAllDto } from '../dto/post/post-get-all.dto';
import type { PostGetOneDto } from '../dto/post/post-get-one.dto';
import type { PostUpdateDto } from '../dto/post/post-update.dto';

@Injectable()
export class PostPrivateService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<Post> {
		return this.apiService.post('/api/v1/posts-private', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
		return this.apiService.get('/api/v1/posts-private', postGetAllDto);
	}

	getOne(postId: number, postGetOneDto?: PostGetOneDto): Observable<Post> {
		return this.apiService.get('/api/v1/posts-private/' + postId, postGetOneDto);
	}

	update(postId: number, postUpdateDto: PostUpdateDto): Observable<Post> {
		return this.apiService.put('/api/v1/posts-private/' + postId, postUpdateDto);
	}

	delete(postId: number, postDeleteDto: PostDeleteDto): Observable<Partial<Post>> {
		return this.apiService.delete('/api/v1/posts-private/' + postId, postDeleteDto);
	}
}
