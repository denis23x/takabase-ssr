/** @format */

import { Component, inject, Input, numberAttribute, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, Subscription } from 'rxjs';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { InfiniteScrollMixin as IS } from '../../core/mixins/infinite-scroll.mixin';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		ScrollPresetDirective,
		SvgIconComponent,
		MarkdownPipe,
		SanitizerPipe,
		DropdownComponent,
		SkeletonDirective,
		CopyToClipboardDirective,
		AsyncPipe,
		CardPostComponent
	],
	selector: 'app-user-private',
	templateUrl: './private.component.html'
})
export class UserPrivateComponent extends CU(IS(class {})) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);

	@Input({ transform: numberAttribute })
	set deleteId(deleteId: number | undefined) {
		if (deleteId) {
			this.router
				.navigate([], {
					queryParams: {
						...this.activatedRoute.snapshot.queryParams,
						deleteId: null
					},
					queryParamsHandling: 'merge',
					relativeTo: this.activatedRoute,
					replaceUrl: true
				})
				.then(() => (this.postList = this.postList.filter((post: Post) => post.id !== deleteId)));
		}
	}

	activatedRouteParamsUsername$: Subscription | undefined;

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = true;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	ngOnInit(): void {
		super.ngOnInit();

		this.activatedRouteParamsUsername$?.unsubscribe();
		this.activatedRouteParamsUsername$ = this.activatedRoute.params
			.pipe(distinctUntilKeyChanged('username'))
			.subscribe({
				next: () => {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		[
			this.activatedRouteParamsUsername$,
			this.currentUser$,
			this.currentUserSkeletonToggle$,
			this.postListRequest$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;
		this.postListIsHasMore = false;
	}

	setResolver(): void {
		this.getPostList();
	}

	/** PostList */

	getPostList(postListLoadMore: boolean = false): void {
		this.postList = [];
		this.postListSkeletonToggle = false;
		this.postListIsHasMore = false;
		this.postListIsLoading.set(false);
	}
}
