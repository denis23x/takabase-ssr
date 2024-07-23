/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { PostPassword } from '../models/post-password.model';
import type { PostPasswordGetAllDto } from '../dto/post-password/post-password-get-all.dto';
import type { PostPasswordCreateDto } from '../dto/post-password/post-password-create.dto';
import type { PostPasswordGetOneDto } from '../dto/post-password/post-password-get-one.dto';
import type { PostPasswordUpdateDto } from '../dto/post-password/post-password-update.dto';
import type { PostPasswordDeleteDto } from '../dto/post-password/post-password-delete.dto';

@Injectable()
export class PostPasswordService {
	private readonly apiService: ApiService = inject(ApiService);

	/** REST */

	create(postPasswordCreateDto: PostPasswordCreateDto): Observable<PostPassword> {
		return this.apiService.post('/v1/posts-password', postPasswordCreateDto);
	}

	getAll(postPasswordGetAllDto: PostPasswordGetAllDto): Observable<PostPassword[]> {
		return this.apiService.get('/v1/posts-password', postPasswordGetAllDto);
	}

	getOne(postPasswordId: number, postPasswordGetOneDto: PostPasswordGetOneDto): Observable<PostPassword> {
		return this.apiService.get('/v1/posts-password/' + postPasswordId, postPasswordGetOneDto);
	}

	update(postPasswordId: number, postPasswordUpdateDto: PostPasswordUpdateDto): Observable<PostPassword> {
		return this.apiService.put('/v1/posts-password/' + postPasswordId, postPasswordUpdateDto);
	}

	delete(postPasswordId: number, postPasswordDeleteDto: PostPasswordDeleteDto): Observable<Partial<PostPassword>> {
		return this.apiService.delete('/v1/posts-password/' + postPasswordId, postPasswordDeleteDto);
	}
}
