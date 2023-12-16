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
import { AbstractSearchListComponent } from '../../abstracts/abstract-search-list.component';
import { CardUserComponent } from '../../standalone/components/card/user/user.component';
import { AppSkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { UserService } from '../../core/services/user.service';
import { MetaService } from '../../core/services/meta.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { Subscription } from 'rxjs';

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
		AppSkeletonDirective
	],
	selector: 'app-search-user',
	templateUrl: './user.component.html'
})
export class SearchUserComponent extends AbstractSearchListComponent implements OnInit, OnDestroy {
	userService: UserService = inject(UserService);
	metaService: MetaService = inject(MetaService);
	skeletonService: SkeletonService = inject(SkeletonService);

	/* --- */

	userList: User[] = [];
	userListRequest$: Subscription | undefined;
	userListSkeletonToggle: boolean = false;

	userListGetAllDto: UserGetAllDto | undefined;
	userListGetAllDto$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.userListGetAllDto$?.unsubscribe();
		this.userListGetAllDto$ = this.abstractListGetAllDto$.subscribe({
			next: () => {
				/** Get abstract DTO */

				this.userListGetAllDto = this.getAbstractListGetAllDto();

				/** Apply Data */

				this.setSkeleton();
				this.setResolver();

				/** Apply SEO meta tags */

				this.setMetaTags();
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.userListRequest$, this.userListGetAllDto$].forEach(($: Subscription) => $?.unsubscribe());
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
		const description: string = "Use our search function to find what you're looking for on Draft";

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

		const concat: boolean = this.userListGetAllDto.page !== 1;

		if (!concat) {
			this.setSkeleton();
		}

		this.userListRequest$?.unsubscribe();
		this.userListRequest$ = this.userService.getAll(this.userListGetAllDto).subscribe({
			next: (userList: User[]) => {
				this.userList = concat ? this.userList.concat(userList) : userList;
				this.userListSkeletonToggle = false;

				this.abstractListIsHasMore = userList.length === this.userListGetAllDto.size;
				this.abstractListIsLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}

	getAbstractListLoadMore(): void {
		this.userListGetAllDto.page++;

		this.getAbstractList();
	}
}
