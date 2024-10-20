/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { PostBookmark } from '../models/post-bookmark.model';
import type { PostBookmarkCreateDto } from '../dto/post-bookmark/post-bookmark-create.dto';
import type { PostBookmarkGetAllDto } from '../dto/post-bookmark/post-bookmark-get-all.dto';
import type { PostBookmarkGetOneDto } from '../dto/post-bookmark/post-bookmark-get-one.dto';
import type { PostBookmarkUpdateDto } from '../dto/post-bookmark/post-bookmark-update.dto';

@Injectable()
export class PostBookmarkService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postBookmarkCreateDto: PostBookmarkCreateDto): Observable<PostBookmark> {
		return this.apiService.post<PostBookmark>('/api/v1/posts-bookmark', postBookmarkCreateDto);
	}

	getAll<T>(postBookmarkGetAllDto: PostBookmarkGetAllDto): Observable<T> {
		return this.apiService.get<T>('/api/v1/posts-bookmark', postBookmarkGetAllDto);
	}

	getOne<T>(postId: number, postBookmarkGetOneDto: PostBookmarkGetOneDto): Observable<T> {
		return this.apiService.get<T>('/api/v1/posts-bookmark/' + postId, postBookmarkGetOneDto);
	}

	update(postId: number, postBookmarkUpdateDto: PostBookmarkUpdateDto): Observable<PostBookmark> {
		return this.apiService.put<PostBookmark>('/api/v1/posts-bookmark/' + postId, postBookmarkUpdateDto);
	}

	delete(postId: number): Observable<Partial<PostBookmark>> {
		return this.apiService.delete<Partial<PostBookmark>>('/api/v1/posts-bookmark/' + postId);
	}
}
