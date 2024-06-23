/** @format */

import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../core/models/post.model';
import { PostService } from '../core/services/post.service';
import { SkeletonService } from '../core/services/skeleton.service';
import { PostGetOneDto } from '../core/dto/post/post-get-one.dto';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { from, Subscription, throwError } from 'rxjs';
import { PlatformService } from '../core/services/platform.service';
import { HelperService } from '../core/services/helper.service';
import { ApiService } from '../core/services/api.service';

@Component({
	selector: 'app-abstract-post',
	template: ''
})
export abstract class AbstractPostComponent implements OnInit, OnDestroy {
	public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	public readonly router: Router = inject(Router);
	public readonly postService: PostService = inject(PostService);
	public readonly skeletonService: SkeletonService = inject(SkeletonService);
	public readonly platformService: PlatformService = inject(PlatformService);
	public readonly helperService: HelperService = inject(HelperService);
	public readonly apiService: ApiService = inject(ApiService);

	/** https://unicorn-utterances.com/posts/angular-extend-class */

	// prettier-ignore
	@ViewChild('abstractPostProseDialog', { static: true }) abstractPostProseDialog: ElementRef<HTMLDialogElement> | undefined;

	abstractPost: Post | undefined;
	abstractPostRequest$: Subscription | undefined;
	abstractPostSkeletonToggle: boolean = true;

	ngOnInit(): void {
		/** Apply Data */

		this.setAbstractSkeleton();
	}

	ngOnDestroy(): void {
		[this.abstractPostRequest$].forEach(($: Subscription) => $?.unsubscribe());

		this.setAbstractPostProseDialogClose(false);
	}

	setAbstractSkeleton(): void {
		this.abstractPost = this.skeletonService.getPost(['category', 'user']);
		this.abstractPostSkeletonToggle = true;

		/** Avoid SSR issue NotYetImplemented */

		if (this.platformService.isBrowser()) {
			this.abstractPostProseDialog.nativeElement.showModal();
		} else {
			this.abstractPostProseDialog.nativeElement.classList.add('modal-open');
		}
	}

	getAbstractPost(postId: number, postGetOneDto: PostGetOneDto): void {
		this.abstractPostRequest$ = this.postService
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
				})
			)
			.subscribe({
				next: (post: Post) => {
					this.abstractPost = post;
					this.abstractPostSkeletonToggle = false;

					this.postService.setPostMetaTags(this.abstractPost);
					this.postService.setPostTitle(this.abstractPost.name);
				},
				error: (error: any) => console.error(error)
			});
	}

	setAbstractPostProseDialogClose(redirect: boolean = true): void {
		/** Avoid SSR issue NotYetImplemented */

		if (this.platformService.isBrowser()) {
			this.abstractPost = undefined;
			this.abstractPostProseDialog.nativeElement.close();

			this.postService.removePostMeta();
			this.postService.removePostTitle();

			if (redirect) {
				this.router
					.navigate(['.'], {
						relativeTo: this.activatedRoute.parent,
						queryParamsHandling: 'preserve'
					})
					.catch((error: any) => {
						this.helperService.getNavigationError(this.router.lastSuccessfulNavigation, error);
					});
			}
		}
	}
}
