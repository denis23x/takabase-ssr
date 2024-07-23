/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { PostPrivate } from '../models/post-private.model';
import type { PostPrivateGetAllDto } from '../dto/post-private/post-private-get-all.dto';
import type { PostPrivateCreateDto } from '../dto/post-private/post-private-create.dto';
import type { PostPrivateGetOneDto } from '../dto/post-private/post-private-get-one.dto';
import type { PostPrivateUpdateDto } from '../dto/post-private/post-private-update.dto';
import type { PostPrivateDeleteDto } from '../dto/post-private/post-private-delete.dto';

@Injectable()
export class PostPrivateService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postCreateDto: PostPrivateCreateDto): Observable<PostPrivate> {
		return this.apiService.post('/v1/posts-private', postCreateDto);
	}

	getAll(postGetAllDto: PostPrivateGetAllDto): Observable<PostPrivate[]> {
		return this.apiService.get('/v1/posts-private', postGetAllDto);
	}

	getOne(id: number, postGetOneDto: PostPrivateGetOneDto): Observable<PostPrivate> {
		return this.apiService.get('/v1/posts-private/' + id, postGetOneDto);
	}

	update(id: number, postUpdateDto: PostPrivateUpdateDto): Observable<PostPrivate> {
		return this.apiService.put('/v1/posts-private/' + id, postUpdateDto);
	}

	delete(id: number, postDeleteDto: PostPrivateDeleteDto): Observable<Partial<PostPrivate>> {
		return this.apiService.delete('/v1/posts-private/' + id, postDeleteDto);
	}
}
