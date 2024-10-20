/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { PostPrivate } from '../models/post.model';
import type { PostCreateDto } from '../dto/post/post-create.dto';
import type { PostGetAllDto } from '../dto/post/post-get-all.dto';
import type { PostGetOneDto } from '../dto/post/post-get-one.dto';
import type { PostUpdateDto } from '../dto/post/post-update.dto';

@Injectable()
export class PostPrivateService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<PostPrivate> {
		return this.apiService.post<PostPrivate>('/api/v1/posts-private', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<PostPrivate[]> {
		return this.apiService.get<PostPrivate[]>('/api/v1/posts-private', postGetAllDto);
	}

	getOne(postId: number, postGetOneDto?: PostGetOneDto): Observable<PostPrivate> {
		return this.apiService.get<PostPrivate>('/api/v1/posts-private/' + postId, postGetOneDto);
	}

	update(postId: number, postUpdateDto: PostUpdateDto): Observable<PostPrivate> {
		return this.apiService.put<PostPrivate>('/api/v1/posts-private/' + postId, postUpdateDto);
	}

	delete(postId: number): Observable<Partial<PostPrivate>> {
		return this.apiService.delete<Partial<PostPrivate>>('/api/v1/posts-private/' + postId);
	}
}
