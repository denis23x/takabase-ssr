/** @format */

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PostGetAllDto } from '../dto/post/post-get-all.dto';
import { Post } from '../models/post.model';
import { PostCreateDto } from '../dto/post/post-create.dto';
import { PostGetOneDto } from '../dto/post/post-get-one.dto';
import { PostUpdateDto } from '../dto/post/post-update.dto';
import { PostDeleteDto } from '../dto/post/post-delete.dto';
import { Navigation, Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class PostService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly router: Router = inject(Router);

	/** SPA helper */

	removePost(postList: Post[]): Post[] {
		const navigation: Navigation | null = this.router.getCurrentNavigation();

		if (navigation?.extras?.state?.action === 'post-delete') {
			return postList.filter((post: Post) => post.id !== navigation.extras.state.data.id);
		}

		return postList;
	}

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<Post> {
		return this.apiService.post('/v1/posts', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
		return this.apiService.get('/v1/posts', postGetAllDto);
	}

	getOne(id: number, postGetOneDto: PostGetOneDto): Observable<Post> {
		return this.apiService.get('/v1/posts/' + id, postGetOneDto);
	}

	update(id: number, postUpdateDto: PostUpdateDto): Observable<Post> {
		return this.apiService.put('/v1/posts/' + id, postUpdateDto);
	}

	delete(id: number, postDeleteDto: PostDeleteDto): Observable<Partial<Post>> {
		return this.apiService.delete('/v1/posts/' + id, postDeleteDto);
	}
}
