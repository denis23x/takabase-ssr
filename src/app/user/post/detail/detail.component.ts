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
import { MetaService } from '../../../core/services/meta.service';
import { PostService } from '../../../core/services/post.service';
import { MetaOpenGraph, MetaTwitter } from '../../../core/models/meta.model';

@Component({
	standalone: true,
	imports: [
		OverlayComponent,
		WindowComponent,
		PostDetailComponent,
		ShareComponent
	],
	selector: 'app-user-post-detail',
	templateUrl: './detail.component.html'
})
export class UserPostDetailComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	post: Post | undefined;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private metaService: MetaService,
		private postService: PostService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (post: Post) => (this.post = post),
				error: (error: any) => console.error(error)
			});

		this.setMeta();
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
		const postMeta: any = this.postService.getPostMeta(this.post);

		const metaOpenGraph: MetaOpenGraph = postMeta.metaOpenGraph;
		const metaTwitter: MetaTwitter = postMeta.metaTwitter;

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
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
