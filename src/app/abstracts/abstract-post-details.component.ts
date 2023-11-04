/** @format */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../core/models/post.model';
import { PostService } from '../core/services/post.service';
import { SkeletonService } from '../core/services/skeleton.service';
import { PostGetOneDto } from '../core/dto/post/post-get-one.dto';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, throwError } from 'rxjs';

@Component({
	selector: 'app-abstract-post-details',
	template: ''
})
export abstract class AbstractPostDetailsComponent implements OnInit, OnDestroy {
	/** https://unicorn-utterances.com/posts/angular-extend-class */

	// prettier-ignore
	@ViewChild('abstractPostProseDialog', { static: true }) abstractPostProseDialog: ElementRef<HTMLDialogElement> | undefined;

	abstractPost: Post | undefined;
	abstractPostRequest$: Subscription | undefined;
	abstractPostSkeletonToggle: boolean = true;

	constructor(
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public postService: PostService,
		public skeletonService: SkeletonService
	) {}

	ngOnInit(): void {
		/** Apply Data */

		this.setAbstractSkeleton();
	}

	ngOnDestroy(): void {
		[this.abstractPostRequest$].forEach(($: Subscription) => $.unsubscribe());

		this.setAbstractPostProseDialogClose(false);
	}

	setAbstractSkeleton(): void {
		this.abstractPost = this.skeletonService.getPost(['category', 'user']);
		this.abstractPostSkeletonToggle = true;
		this.abstractPostProseDialog.nativeElement.showModal();
	}

	getAbstractPost(postId: number, postGetOneDto: PostGetOneDto): void {
		this.abstractPostRequest$ = this.postService
			.getOne(postId, postGetOneDto)
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router
						.navigate(['/error', httpErrorResponse.status])
						.then(() => console.debug('Route changed'));

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
		this.abstractPost = undefined;
		this.abstractPostProseDialog.nativeElement.close();

		this.postService.removePostMeta();
		this.postService.removePostTitle();

		if (redirect) {
			this.router
				.navigate(['..'], {
					relativeTo: this.activatedRoute,
					queryParamsHandling: 'preserve'
				})
				.then(() => console.debug('Route changed'));
		}
	}
}
