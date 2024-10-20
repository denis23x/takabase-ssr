/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { PostPassword } from '../models/post.model';
import type { PostCreateDto } from '../dto/post/post-create.dto';
import type { PostGetOneDto } from '../dto/post/post-get-one.dto';
import type { PostGetAllDto } from '../dto/post/post-get-all.dto';
import type { PostUpdateDto } from '../dto/post/post-update.dto';

@Injectable()
export class PostPasswordService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<PostPassword> {
		return this.apiService.post<PostPassword>('/api/v1/posts-password', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<PostPassword[]> {
		return this.apiService.get<PostPassword[]>('/api/v1/posts-password', postGetAllDto);
	}

	getOne(postId: number, postGetOneDto?: PostGetOneDto): Observable<PostPassword> {
		return this.apiService.get<PostPassword>('/api/v1/posts-password/' + postId, postGetOneDto);
	}

	update(postId: number, postUpdateDto: PostUpdateDto): Observable<PostPassword> {
		return this.apiService.put<PostPassword>('/api/v1/posts-password/' + postId, postUpdateDto);
	}

	delete(postId: number): Observable<Partial<PostPassword>> {
		return this.apiService.delete<Partial<PostPassword>>('/api/v1/posts-password/' + postId);
	}
}
