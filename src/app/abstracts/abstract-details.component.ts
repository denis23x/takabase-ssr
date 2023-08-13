/** @format */

import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Post } from '../core/models/post.model';
import { PostService } from '../core/services/post.service';

@Component({
	selector: 'app-abstract-details',
	template: ''
})
export abstract class AbstractDetailsComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('abstractPostProseModal', { static: true }) abstractPostProseModal: ElementRef<HTMLDialogElement> | undefined;

	activatedRouteData$: Subscription | undefined;

	abstractPost: Post | undefined;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private postService: PostService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (post: Post) => {
					this.abstractPost = post;
					this.abstractPostProseModal.nativeElement.showModal();

					this.postService.setPostMeta(this.abstractPost);
					this.postService.setPostTitle(this.abstractPost.name);
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());

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
