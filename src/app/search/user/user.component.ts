/** @format */

import { Component, makeStateKey, OnDestroy, OnInit, StateKey } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { User } from '../../core/models/user.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { UserGetAllDto } from '../../core/dto/user/user-get-all.dto';
import { AbstractSearchComponent } from '../../abstracts/abstract-search.component';
import { CardUserComponent } from '../../standalone/components/card/user/user.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { from, Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { environment } from '../../../environments/environment';
import { filter, tap } from 'rxjs/operators';
import { CurrentUser } from '../../core/models/current-user.model';
import { AuthenticatedComponent } from '../../standalone/components/authenticated/authenticated.component';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';

const searchResponseKey: StateKey<SearchResponse> = makeStateKey<SearchResponse>('searchResponse');

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
		CopyToClipboardDirective,
		AuthenticatedComponent
	],
	selector: 'app-search-user',
	templateUrl: './user.component.html'
})
export class SearchUserComponent extends AbstractSearchComponent implements OnInit, OnDestroy {
	userList: User[] = [];
	userListRequest$: Subscription | undefined;
	userListSkeletonToggle: boolean = true;

	userGetAllDto: UserGetAllDto | undefined;
	userGetAllDto$: Subscription | undefined;

	currentUserInviteURL: string | undefined;
	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.userGetAllDto$?.unsubscribe();
		this.userGetAllDto$ = this.abstractGetAllDto$
			.pipe(tap(() => (this.userGetAllDto = this.getAbstractGetAllDto())))
			.subscribe({
				next: () => {
					if (this.transferState.hasKey(searchResponseKey)) {
						this.setSearchResponse(this.transferState.get(searchResponseKey, null));

						if (this.platformService.isBrowser()) {
							this.transferState.remove(searchResponseKey);
						}
					} else {
						/** Apply Data */

						this.setSkeleton();
						this.setResolver();

						/** Apply SEO meta tags */

						this.setMetaTags();
					}
				},
				error: (error: any) => console.error(error)
			});

		/** Make invite link */

		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService
			.getCurrentUser()
			.pipe(
				filter((currentUser: CurrentUser | undefined) => !!currentUser),
				tap((currentUser: CurrentUser) => (this.currentUser = currentUser))
			)
			.subscribe({
				next: () => {
					const inviteURL: URL = new URL(environment.appUrl);

					inviteURL.pathname = 'registration';
					inviteURL.searchParams.append('invitedBy', String(this.currentUser.id));

					this.currentUserInviteURL = inviteURL.toString();
				},
				error: (error: any) => console.error(error)
			});

		this.currentUserSkeletonToggle$?.unsubscribe();
		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserSkeletonToggle = false),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.userListRequest$, this.userGetAllDto$, this.currentUser$, this.currentUserSkeletonToggle$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.userList = this.skeletonService.getUserList();
		this.userListSkeletonToggle = true;

		// Hide load more

		this.abstractListIsHasMore = false;
	}

	setResolver(): void {
		this.getAbstractList();
	}

	setSearchResponse(searchResponse: SearchResponse): void {
		const userList: User[] = searchResponse.hits as any[];
		const userListIsHasMore: boolean = searchResponse.page !== searchResponse.nbPages;

		this.userList = this.userGetAllDto.page > 1 ? this.userList.concat(userList) : userList;
		this.userListSkeletonToggle = false;

		this.abstractListIsHasMore = userListIsHasMore && searchResponse.nbPages > 1;
		this.abstractListIsLoading$.next(false);
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

	getAbstractList(): void {
		this.abstractListIsLoading$.next(true);

		/** Algolia */

		const userQuery: string = this.userGetAllDto.query?.trim();
		const userIndex: SearchIndex = this.algoliaService.getSearchIndex('user');
		const userIndexSearch: SearchOptions = {
			page: this.userGetAllDto.page - 1,
			hitsPerPage: this.userGetAllDto.size
		};

		this.userListRequest$?.unsubscribe();
		this.userListRequest$ = from(userIndex.search(userQuery, userIndexSearch)).subscribe({
			next: (searchResponse: SearchResponse) => {
				this.setSearchResponse(searchResponse);

				if (this.platformService.isServer()) {
					this.transferState.set(searchResponseKey, searchResponse);
				}
			},
			error: (error: any) => console.error(error)
		});
	}

	getAbstractListLoadMore(): void {
		this.userGetAllDto.page++;

		this.getAbstractList();
	}
}
