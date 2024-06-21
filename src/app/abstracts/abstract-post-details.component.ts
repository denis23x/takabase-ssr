/** @format */

import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../core/models/post.model';
import { PostService } from '../core/services/post.service';
import { SkeletonService } from '../core/services/skeleton.service';
import { PostGetOneDto } from '../core/dto/post/post-get-one.dto';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, throwError } from 'rxjs';
import { PlatformService } from '../core/services/platform.service';
import { Location } from '@angular/common';

@Component({
	selector: 'app-abstract-post-details',
	template: ''
})
export abstract class AbstractPostDetailsComponent implements OnInit, OnDestroy {
	public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	public readonly router: Router = inject(Router);
	public readonly postService: PostService = inject(PostService);
	public readonly skeletonService: SkeletonService = inject(SkeletonService);
	public readonly platformService: PlatformService = inject(PlatformService);
	public readonly location: Location = inject(Location);

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
		/** Avoid SSR issue NotYetImplemented */

		if (this.platformService.isBrowser()) {
			this.abstractPost = this.skeletonService.getPost(['category', 'user']);
			this.abstractPostSkeletonToggle = true;
			this.abstractPostProseDialog.nativeElement.showModal();
		}
	}

	getAbstractPost(postId: number, postGetOneDto: PostGetOneDto): void {
		this.abstractPostRequest$ = this.postService
			.getOne(postId, postGetOneDto)
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router.navigate(['/error', httpErrorResponse.status]).then(() => console.debug('Route changed'));

					return throwError(() => httpErrorResponse);
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
				this.location.back();
			}
		}
	}
}
