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

	create(postCreateDto: PostPasswordCreateDto): Observable<PostPassword> {
		return this.apiService.post('/v1/posts-password', postCreateDto);
	}

	getAll(postGetAllDto: PostPasswordGetAllDto): Observable<PostPassword[]> {
		return this.apiService.get('/v1/posts-password', postGetAllDto);
	}

	getOne(id: number, postGetOneDto: PostPasswordGetOneDto): Observable<PostPassword> {
		return this.apiService.get('/v1/posts-password/' + id, postGetOneDto);
	}

	update(id: number, postUpdateDto: PostPasswordUpdateDto): Observable<PostPassword> {
		return this.apiService.put('/v1/posts-password/' + id, postUpdateDto);
	}

	delete(id: number, postDeleteDto: PostPasswordDeleteDto): Observable<Partial<PostPassword>> {
		return this.apiService.delete('/v1/posts-password/' + id, postDeleteDto);
	}
}
