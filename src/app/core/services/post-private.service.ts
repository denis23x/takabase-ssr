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

	create(postPrivateCreateDto: PostPrivateCreateDto): Observable<PostPrivate> {
		return this.apiService.post('/v1/posts-private', postPrivateCreateDto);
	}

	getAll(postPrivateGetAllDto: PostPrivateGetAllDto): Observable<PostPrivate[]> {
		return this.apiService.get('/v1/posts-private', postPrivateGetAllDto);
	}

	getOne(postPrivateId: number, postPrivateGetOneDto: PostPrivateGetOneDto): Observable<PostPrivate> {
		return this.apiService.get('/v1/posts-private/' + postPrivateId, postPrivateGetOneDto);
	}

	update(postPrivateId: number, postPrivateUpdateDto: PostPrivateUpdateDto): Observable<PostPrivate> {
		return this.apiService.put('/v1/posts-private/' + postPrivateId, postPrivateUpdateDto);
	}

	delete(postPrivateId: number, postPrivateDeleteDto: PostPrivateDeleteDto): Observable<Partial<PostPrivate>> {
		return this.apiService.delete('/v1/posts-private/' + postPrivateId, postPrivateDeleteDto);
	}
}
