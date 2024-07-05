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
import { LoadMoreComponent } from '../../standalone/components/load-more/load-more.component';
import { SearchResponse } from '@algolia/client-search';

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
		CardPostComponent,
		LoadMoreComponent
	],
	selector: 'app-user-password',
	templateUrl: './password.component.html'
})
export class UserPasswordComponent extends CU(class {}) implements OnInit, OnDestroy {
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

	postList: Post[] = [];
	postListSkeletonToggle: boolean = true;
	postListIsLoading: boolean = false;
	postListRequest$: Subscription | undefined;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	postListSearchFormToggle: boolean = false;
	postListSearchResponse: Omit<SearchResponse<Post>, 'hits'> | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.currentUser$, this.currentUserSkeletonToggle$, this.postListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;
	}

	setResolver(): void {
		this.getPostList();
	}

	/** PostList */

	getPostList(postListLoadMore: boolean = false): void {
		this.postList = [];
		this.postListSkeletonToggle = false;
	}
}
