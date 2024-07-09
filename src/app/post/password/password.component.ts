/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { ShareComponent } from '../../standalone/components/share/share.component';
import { PostProseComponent } from '../../standalone/components/post/prose/prose.component';
import { PostGetOneDto } from '../../core/dto/post/post-get-one.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { from, Subscription, throwError } from 'rxjs';
import { Post } from '../../core/models/post.model';
import { PostService } from '../../core/services/post.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { PlatformService } from '../../core/services/platform.service';
import { ApiService } from '../../core/services/api.service';
import { PostStore } from '../post.store';

@Component({
	standalone: true,
	imports: [PostProseComponent, ShareComponent],
	selector: 'app-post-password',
	templateUrl: './password.component.html'
})
export class PostPasswordComponent implements OnInit {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly postService: PostService = inject(PostService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly router: Router = inject(Router);
	private readonly postStore: PostStore = inject(PostStore);

	post: Post | undefined;
	postRequest$: Subscription | undefined;
	postSkeletonToggle: boolean = true;

	ngOnInit(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		[this.postRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.post = this.skeletonService.getPost(['category', 'user']);
		this.postSkeletonToggle = true;
	}

	setResolver(): void {
		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
		const postGetOneDto: PostGetOneDto = {
			scope: ['user', 'category']
		};

		this.postRequest$ = this.postService
			.getOne(postId, postGetOneDto)
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					/** Set Transfer State */

					if (this.platformService.isServer()) {
						this.apiService.setHttpErrorResponseKey(httpErrorResponse);
					}

					/** Redirect */

					return from(this.router.navigate(['/error', httpErrorResponse.status])).pipe(
						switchMap(() => throwError(() => httpErrorResponse))
					);
				}),
				tap((post: Post) => this.postStore.setPost(post))
			)
			.subscribe({
				next: (post: Post) => {
					this.post = post;
					this.postSkeletonToggle = false;

					this.postService.setPostMetaTags(this.post);
					this.postService.setPostTitle(this.post.name);
				},
				error: (error: any) => console.error(error)
			});
	}
}
