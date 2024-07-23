/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { ShareComponent } from '../../standalone/components/share/share.component';
import { PostProseComponent } from '../../standalone/components/post/prose/prose.component';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { from, Subscription, throwError } from 'rxjs';
import { PostPrivateService } from '../../core/services/post-private.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { PlatformService } from '../../core/services/platform.service';
import { ApiService } from '../../core/services/api.service';
import { PostStore } from '../post.store';
import type { PostPrivate } from '../../core/models/post-private.model';
import type { PostPrivateGetOneDto } from '../../core/dto/post-private/post-private-get-one.dto';
import type { HttpErrorResponse } from '@angular/common/http';

@Component({
	standalone: true,
	imports: [PostProseComponent, ShareComponent],
	providers: [PostPrivateService],
	selector: 'app-post-private',
	templateUrl: './private.component.html'
})
export class PostPrivateComponent implements OnInit {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly postPrivateService: PostPrivateService = inject(PostPrivateService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly router: Router = inject(Router);
	private readonly postStore: PostStore = inject(PostStore);

	postPrivate: PostPrivate | undefined;
	postPrivateRequest$: Subscription | undefined;
	postPrivateSkeletonToggle: boolean = true;

	ngOnInit(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		[this.postPrivateRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postPrivate = this.skeletonService.getPost(['user']);
		this.postPrivateSkeletonToggle = true;
	}

	setResolver(): void {
		const postPrivateId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
		const postPrivateGetOneDto: PostPrivateGetOneDto = {
			scope: ['user']
		};

		this.postPrivateRequest$ = this.postPrivateService
			.getOne(postPrivateId, postPrivateGetOneDto)
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
				tap((postPrivate: PostPrivate) => this.postStore.setPost(postPrivate))
			)
			.subscribe({
				next: (postPrivate: PostPrivate) => {
					this.postPrivate = postPrivate;
					this.postPrivateSkeletonToggle = false;
				},
				error: (error: any) => console.error(error)
			});
	}
}
