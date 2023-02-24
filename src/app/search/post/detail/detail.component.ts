/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { OverlayComponent } from '../../../shared/components/overlay/overlay.component';
import { WindowComponent } from '../../../shared/components/window/window.component';
import { ShareComponent } from '../../../shared/components/share/share.component';
import { PostDetailComponent } from '../../../shared/components/post/detail/detail.component';
import { Post } from '../../../core/models/post.model';
import { PostService } from '../../../core/services/post.service';
import { TitleService } from '../../../core/services/title.service';

@Component({
	standalone: true,
	imports: [
		OverlayComponent,
		WindowComponent,
		PostDetailComponent,
		ShareComponent
	],
	selector: 'app-search-post-detail',
	templateUrl: './detail.component.html'
})
export class SearchPostDetailComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	post: Post | undefined;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private postService: PostService,
		private titleService: TitleService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (post: Post) => {
					this.post = post;

					this.postService.appendPostMeta(this.post);

					this.titleService.appendTitle(this.post.name);
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onClose(): void {
		this.router
			.navigate(['..'], {
				relativeTo: this.activatedRoute,
				queryParamsHandling: 'preserve'
			})
			.then(() => console.debug('Route changed'));
	}
}
