/** @format */

import { Component, inject, makeStateKey, OnDestroy, OnInit, StateKey, TransferState } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { CardUserComponent } from '../../standalone/components/card/user/user.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { BehaviorSubject, distinctUntilKeyChanged, from, Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { AuthenticatedComponent } from '../../standalone/components/authenticated/authenticated.component';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { MetaService } from '../../core/services/meta.service';
import { AlgoliaService } from '../../core/services/algolia.service';
import { PlatformService } from '../../core/services/platform.service';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { CookiesService } from '../../core/services/cookies.service';
import type { User } from '../../core/models/user.model';
import type { UserGetAllDto } from '../../core/dto/user/user-get-all.dto';
import type { SearchIndex } from 'algoliasearch/lite';
import type { SearchOptions, SearchResponse } from '@algolia/client-search';
import type { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';

const searchResponseKey: StateKey<SearchResponse<User>> = makeStateKey<SearchResponse<User>>('searchResponse');

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AvatarComponent,
		SvgIconComponent,
		DayjsPipe,
		CardUserComponent,
		SkeletonDirective,
		AdComponent,
		AuthenticatedComponent,
		ListLoadMoreComponent,
		ListMockComponent
	],
	providers: [AlgoliaService],
	selector: 'app-search-user',
	templateUrl: './user.component.html'
})
export class SearchUserComponent implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly algoliaService: AlgoliaService = inject(AlgoliaService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly transferState: TransferState = inject(TransferState);
	private readonly cookiesService: CookiesService = inject(CookiesService);

	activatedRouteQueryParams$: Subscription | undefined;

	userList: User[] = [];
	userListSkeletonToggle: boolean = true;
	userListRequest$: Subscription | undefined;
	userGetAllDto: UserGetAllDto = {
		page: 0,
		size: 20
	};

	userListSearchResponse: Omit<SearchResponse<User>, 'hits'> | undefined;
	userListIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	ngOnInit(): void {
		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.pipe(distinctUntilKeyChanged('query')).subscribe({
			next: () => {
				if (this.transferState.hasKey(searchResponseKey)) {
					this.setUserListSearchResponse(this.transferState.get(searchResponseKey, null));

					if (this.platformService.isBrowser()) {
						this.transferState.remove(searchResponseKey);
					}
				} else {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				}
			},
			error: (error: any) => console.error(error)
		});

		/** Set cookie for soft redirect */

		this.cookiesService.setItem('page-redirect-search', 'users');

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.activatedRouteQueryParams$, this.userListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.userList = this.skeletonService.getUserList();
		this.userListSkeletonToggle = true;
	}

	setResolver(): void {
		this.getUserList();
	}

	setMetaTags(): void {
		const title: string = 'Search users';
		const description: string = "Use the search to find what you're looking for";

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}

	/** UserList */

	getUserList(userListLoadMore: boolean = false): void {
		this.userListIsLoading$.next(true);

		/** Algolia */

		const userQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const userIndex: SearchIndex = this.algoliaService.getSearchIndex('user');
		const userIndexSearch: SearchOptions = {
			highlightPreTag: '<mark class="bg-success/25 text-success-content">',
			highlightPostTag: '</mark>',
			page: (() => (this.userGetAllDto.page = userListLoadMore ? this.userGetAllDto.page + 1 : 0))(),
			hitsPerPage: this.userGetAllDto.size
		};

		this.userListRequest$?.unsubscribe();
		this.userListRequest$ = from(userIndex.search(userQuery, userIndexSearch)).subscribe({
			next: (searchResponse: SearchResponse<any>) => {
				this.setUserListSearchResponse(searchResponse);

				if (this.platformService.isServer()) {
					this.transferState.set(searchResponseKey, searchResponse);
				}
			},
			error: (error: any) => console.error(error)
		});
	}

	setUserListSearchResponse(searchResponse: SearchResponse<User> | null): void {
		const { hits: userList, ...userListSearchResponse }: any = searchResponse;

		// Set

		this.userList = searchResponse.page > 0 ? this.userList.concat(userList) : userList;
		this.userListSearchResponse = userListSearchResponse;
		this.userListSkeletonToggle = false;
		this.userListIsLoading$.next(false);
	}
}
