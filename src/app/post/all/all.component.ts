/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ShareComponent } from '../../standalone/components/share/share.component';
import { PostProseComponent } from '../../standalone/components/post/prose/prose.component';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { from, Subscription, throwError } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { PlatformService } from '../../core/services/platform.service';
import { ApiService } from '../../core/services/api.service';
import { PostStore } from '../post.store';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import type { Post } from '../../core/models/post.model';
import type { PostGetOneDto } from '../../core/dto/post/post-get-one.dto';
import type { HttpErrorResponse } from '@angular/common/http';

@Component({
	standalone: true,
	imports: [CommonModule, PostProseComponent, ShareComponent, SkeletonDirective, SvgIconComponent, AdComponent],
	providers: [PostService],
	selector: 'app-post-all',
	templateUrl: './all.component.html'
})
export class PostAllComponent implements OnInit, OnDestroy {
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

		this.postRequest$?.unsubscribe();
		this.postRequest$ = this.postService
			.getOne(postId, postGetOneDto)
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					/** Set Transfer State */

					if (this.platformService.isServer()) {
						this.apiService.setHttpErrorResponseKey(httpErrorResponse);
					}

					const redirect$: Promise<boolean> = this.router.navigate(['/error', httpErrorResponse.status], {
						skipLocationChange: true
					});

					return from(redirect$).pipe(switchMap(() => throwError(() => httpErrorResponse)));
				}),
				tap((post: Post) => this.postStore.setPost(post))
			)
			.subscribe({
				next: (post: Post) => {
					this.post = post;
					this.postSkeletonToggle = false;
				},
				error: (error: any) => console.error(error)
			});
	}
}
