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
import { MasonryMixin as M } from '../../core/mixins/masonry.mixin';
import { SearchPostsMixin as SP } from '../../core/mixins/search-posts.mixin';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { SearchFormComponent } from '../../standalone/components/search-form/search-form.component';
import { PostPasswordService } from '../../core/services/post-password.service';
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
	providers: [PostPasswordService],
	selector: 'app-user-password',
	templateUrl: './password.component.html'
})
export class UserPasswordComponent extends CU(M(SP(class {}))) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);

	activatedRouteQueryParams$: Subscription | undefined;

	postPasswordList: Post[] = [];
	postPasswordListSkeletonToggle: boolean = true;
	postPasswordListIsLoading: boolean = false;
	postPasswordListRequest$: Subscription | undefined;
	postPasswordListGetAllDto: PostGetAllDto = {
		page: 0,
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

		// ngOnDestroy
		// prettier-ignore
		[this.activatedRouteQueryParams$, this.postPasswordListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postPasswordList = this.skeletonService.getPostList();
		this.postPasswordListSkeletonToggle = true;

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
				next: () => this.getPostPasswordList(),
				error: (error: any) => console.error(error)
			});
	}

	/** PostPasswordList */

	getPostPasswordList(postPasswordListLoadMore: boolean = false): void {
		this.postPasswordListIsLoading = true;

		// prettier-ignore
		const postPasswordPage: number = (this.postPasswordListGetAllDto.page = postPasswordListLoadMore ? this.postPasswordListGetAllDto.page + 1 : 1);
		const postPasswordQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postPasswordGetAllDto: PostGetAllDto = {
			...this.postPasswordListGetAllDto,
			page: postPasswordPage
		};

		// Query

		if (postPasswordQuery) {
			postPasswordGetAllDto.query = postPasswordQuery;
		}

		this.postPasswordListRequest$?.unsubscribe();
		this.postPasswordListRequest$ = this.postPasswordService.getAll(postPasswordGetAllDto).subscribe({
			next: (postPasswordList: Post[]) => {
				// prettier-ignore
				this.postPasswordList = postPasswordGetAllDto.page > 1 ? this.postPasswordList.concat(postPasswordList) : postPasswordList;
				this.postPasswordListSkeletonToggle = false;
				this.postPasswordListIsLoading = false;

				// Search

				this.searchResponse = {
					isOnePage: postPasswordGetAllDto.page === 1 && postPasswordGetAllDto.size !== postPasswordList.length,
					isEndPage: postPasswordGetAllDto.page !== 1 && postPasswordGetAllDto.size !== postPasswordList.length
				};

				// Masonry

				this.setMasonry();
			},
			error: (error: any) => console.error(error)
		});
	}

	// Explicit types
	// @ts-ignore
	onToggleSearchForm(toggle: boolean): void;
}
