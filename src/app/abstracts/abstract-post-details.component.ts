/** @format */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../core/models/post.model';
import { PostService } from '../core/services/post.service';
import { ApiService } from '../core/services/api.service';
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
	// prettier-ignore
	@ViewChild('abstractPostProseModal', { static: true }) abstractPostProseModal: ElementRef<HTMLDialogElement> | undefined;

	abstractPost: Post | undefined;
	abstractPost$: Subscription | undefined;
	abstractPostSkeletonToggle: boolean = true;

	constructor(
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public postService: PostService,
		public apiService: ApiService,
		public skeletonService: SkeletonService
	) {}

	ngOnInit(): void {
		/** Apply skeleton */

		this.abstractPost = this.skeletonService.getPost(['category', 'user']);
		this.abstractPostSkeletonToggle = true;
		this.abstractPostProseModal.nativeElement.showModal();
	}

	ngOnDestroy(): void {
		[this.abstractPost$].forEach(($: Subscription) => $.unsubscribe());

		this.setAbstractClosePostProseModal(false);
	}

	getAbstractPost(postId: number, postGetOneDto: PostGetOneDto): void {
		this.abstractPost$ = this.postService
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

	setAbstractClosePostProseModal(redirect: boolean = true): void {
		this.abstractPost = undefined;
		this.abstractPostProseModal.nativeElement.close();

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
