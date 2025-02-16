/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { Post } from '../models/post.model';
import type { PostCreateDto } from '../dto/post/post-create.dto';
import type { PostGetAllDto } from '../dto/post/post-get-all.dto';
import type { PostGetOneDto } from '../dto/post/post-get-one.dto';
import type { PostUpdateDto } from '../dto/post/post-update.dto';

@Injectable()
export class PostService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<Post> {
		return this.apiService.post<Post>('/api/v1/posts', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
		return this.apiService.get<Post[]>('/api/v1/posts', postGetAllDto);
	}

	getOne(postId: number, postGetOneDto?: PostGetOneDto): Observable<Post> {
		return this.apiService.get<Post>('/api/v1/posts/' + postId, postGetOneDto);
	}

	update(postId: number, postUpdateDto: PostUpdateDto): Observable<Post> {
		return this.apiService.put<Post>('/api/v1/posts/' + postId, postUpdateDto);
	}

	delete(postId: number): Observable<Partial<Post>> {
		return this.apiService.delete<Partial<Post>>('/api/v1/posts/' + postId);
	}
}
