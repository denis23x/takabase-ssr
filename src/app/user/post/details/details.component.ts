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
import { WindowComponent } from '../../../standalone/components/window/window.component';
import { ShareComponent } from '../../../standalone/components/share/share.component';
import { PostDetailComponent } from '../../../standalone/components/post/prose/prose.component';
import { Post } from '../../../core/models/post.model';
import { PostService } from '../../../core/services/post.service';

@Component({
	standalone: true,
	imports: [WindowComponent, PostDetailComponent, ShareComponent],
	selector: 'app-user-post-details',
	templateUrl: './details.component.html'
})
export class UserPostDetailsComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('postProseModal', { static: true }) postProseModal: ElementRef<HTMLDialogElement> | undefined;

	activatedRouteData$: Subscription | undefined;

	post: Post | undefined;

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
					this.post = post;
					this.postProseModal.nativeElement.showModal();

					this.postService.setPostMeta(this.post);
					this.postService.setPostTitle(this.post.name);
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());

		/** Update meta tags */

		this.onClosePostProseModal(false);
	}

	onClosePostProseModal(redirect: boolean = true): void {
		this.post = undefined;
		this.postProseModal.nativeElement.close();

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
