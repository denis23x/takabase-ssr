/** @format */

import {
	AfterContentInit,
	Component,
	ElementRef,
	OnDestroy,
	ViewChild
} from '@angular/core';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Post } from '../core/models/post.model';
import { PostService } from '../core/services/post.service';

// prettier-ignore
@Component({
	selector: 'app-abstract-details',
	template: ''
})
export abstract class AbstractDetailsComponent implements AfterContentInit, OnDestroy {
	@ViewChild('abstractPostProseModal', { static: true }) abstractPostProseModal: ElementRef<HTMLDialogElement> | undefined;

	activatedRouteData$: Subscription | undefined;

	abstractPost: Post | undefined;

	constructor(
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public postService: PostService
	) {}

  ngAfterContentInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (post: Post) => {
					this.abstractPost = post;
					this.abstractPostProseModal.nativeElement.showModal();

					this.postService.setPostMetaTags(this.abstractPost);
					this.postService.setPostTitle(this.abstractPost.name);
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach(($: Subscription) => $?.unsubscribe());

		/** Update meta tags */

		this.setAbstractClosePostProseModal(false);
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
