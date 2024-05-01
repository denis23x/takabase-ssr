/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { User } from '../../core/models/user.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { UserGetAllDto } from '../../core/dto/user/user-get-all.dto';
import { AbstractSearchComponent } from '../../abstracts/abstract-search.component';
import { CardUserComponent } from '../../standalone/components/card/user/user.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { UserService } from '../../core/services/user.service';
import { MetaService } from '../../core/services/meta.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { AuthenticatedDirective } from '../../standalone/directives/app-authenticated.directive';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { environment } from '../../../environments/environment';
import { filter, tap } from 'rxjs/operators';
import { CurrentUser } from '../../core/models/current-user.model';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AvatarComponent,
		SvgIconComponent,
		UserUrlPipe,
		DayjsPipe,
		CardUserComponent,
		SkeletonDirective,
		AdComponent,
		AuthenticatedDirective,
		CopyToClipboardDirective
	],
	selector: 'app-search-user',
	templateUrl: './user.component.html'
})
export class SearchUserComponent extends AbstractSearchComponent implements OnInit, OnDestroy {
	private readonly userService: UserService = inject(UserService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);

	userList: User[] = [];
	userListRequest$: Subscription | undefined;
	userListSkeletonToggle: boolean = true;

	userGetAllDto: UserGetAllDto | undefined;
	userGetAllDto$: Subscription | undefined;

	userInviteURL: string | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.userGetAllDto$?.unsubscribe();
		this.userGetAllDto$ = this.abstractGetAllDto$.subscribe({
			next: () => {
				/** Get abstract DTO */

				this.userGetAllDto = this.getAbstractGetAllDto();

				/** Apply Data */

				this.setSkeleton();
				this.setResolver();

				/** Apply SEO meta tags */

				this.setMetaTags();
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

					this.userInviteURL = inviteURL.toString();
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.userListRequest$, this.userGetAllDto$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.userList = this.skeletonService.getUserList();
		this.userListSkeletonToggle = true;

		this.abstractListIsHasMore = false;
	}

	setResolver(): void {
		this.getAbstractList();
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

		const concat: boolean = this.userGetAllDto.page !== 1;

		if (!concat) {
			this.setSkeleton();
		}

		this.userListRequest$?.unsubscribe();
		this.userListRequest$ = this.userService.getAll(this.userGetAllDto).subscribe({
			next: (userList: User[]) => {
				this.userList = concat ? this.userList.concat(userList) : userList;
				this.userListSkeletonToggle = false;

				this.abstractListIsHasMore = userList.length === this.userGetAllDto.size;
				this.abstractListIsLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}

	getAbstractListLoadMore(): void {
		this.userGetAllDto.page++;

		this.getAbstractList();
	}
}
