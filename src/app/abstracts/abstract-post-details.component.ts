/** @format */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../core/models/post.model';
import { PostService } from '../core/services/post.service';
import { ApiService } from '../core/services/api.service';
import { SkeletonService } from '../core/services/skeleton.service';

@Component({
	selector: 'app-abstract-post-details',
	template: ''
})
export abstract class AbstractPostDetailsComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('abstractPostProseModal', { static: true }) abstractPostProseModal: ElementRef<HTMLDialogElement> | undefined;

	abstractPost: Post | undefined;
	abstractPostSkeletonToggle: boolean = true;

	constructor(
		public activatedRoute: ActivatedRoute,
		public router: Router,
		public postService: PostService,
		public apiService: ApiService,
		public skeletonService: SkeletonService
	) {}

	ngOnInit(): void {
		console.debug('Abstract ngOnInit');
	}

	ngOnDestroy(): void {
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
