/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { CommonModule } from '@angular/common';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { MasonryPostsMixin as MP } from '../../core/mixins/masonry-posts.mixin';
import { SearchPostsMixin as SP } from '../../core/mixins/search-posts.mixin';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { PostPrivateService } from '../../core/services/post-private.service';
import { SearchFormComponent } from '../../standalone/components/search-form/search-form.component';
import type { Post } from '../../core/models/post.model';
import type { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import type { CustomSearchResponse } from '../../core/models/custom-search.model';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		ScrollPresetDirective,
		SvgIconComponent,
		SanitizerPipe,
		DropdownComponent,
		SkeletonDirective,
		CopyToClipboardDirective,
		CardPostComponent,
		ListLoadMoreComponent,
		ListMockComponent,
		SearchFormComponent
	],
	providers: [PostPrivateService],
	selector: 'app-user-private',
	templateUrl: './private.component.html'
})
export class UserPrivateComponent extends CU(MP(SP(class {}))) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postPrivateService: PostPrivateService = inject(PostPrivateService);

	activatedRouteQueryParams$: Subscription | undefined;

	postPrivateList: Post[] = [];
	postPrivateListSkeletonToggle: boolean = true;
	postPrivateListIsLoading: boolean = false;
	postPrivateListRequest$: Subscription | undefined;
	postPrivateListGetAllDto: PostGetAllDto = {
		page: 1,
		size: 20
	};

	// Explicit types

	searchFormToggle: boolean = false;
	searchResponse: CustomSearchResponse;

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.activatedRouteQueryParams$, this.postPrivateListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postPrivateList = this.skeletonService.getPostList();
		this.postPrivateListSkeletonToggle = true;

		if (this.platformService.isBrowser()) {
			this.setMasonry();
		}
	}

	setResolver(): void {
		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				distinctUntilKeyChanged('query'),
				tap(() => this.setSkeleton())
			)
			.subscribe({
				next: () => this.getPostPrivateList(),
				error: (error: any) => console.error(error)
			});
	}

	/** PostPrivateList */

	getPostPrivateList(postPrivateListLoadMore: boolean = false): void {
		this.postPrivateListIsLoading = true;

		// prettier-ignore
		const postPrivatePage: number = (this.postPrivateListGetAllDto.page = postPrivateListLoadMore ? this.postPrivateListGetAllDto.page + 1 : 1);
		const postPrivateQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postPrivateGetAllDto: PostGetAllDto = {
			...this.postPrivateListGetAllDto,
			page: postPrivatePage
		};

		// Query

		if (postPrivateQuery) {
			postPrivateGetAllDto.query = postPrivateQuery;
		}

		this.postPrivateListRequest$?.unsubscribe();
		this.postPrivateListRequest$ = this.postPrivateService.getAll(postPrivateGetAllDto).subscribe({
			next: (postPrivateList: Post[]) => {
				// prettier-ignore
				this.postPrivateList = postPrivateGetAllDto.page > 1 ? this.postPrivateList.concat(postPrivateList) : postPrivateList;
				this.postPrivateListSkeletonToggle = false;
				this.postPrivateListIsLoading = false;

				// Search

				this.searchResponse = {
					isOnePage: postPrivateGetAllDto.page === 1 && postPrivateGetAllDto.size !== postPrivateList.length,
					isEndPage: postPrivateGetAllDto.page !== 1 && postPrivateGetAllDto.size !== postPrivateList.length
				};
			},
			error: (error: any) => console.error(error),
			complete: () => this.setMasonry()
		});
	}

	// Explicit types
	// @ts-ignore
	onToggleSearchForm(toggle: boolean): void;
}
