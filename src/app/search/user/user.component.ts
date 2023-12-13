/** @format */

import { Component, OnInit } from '@angular/core';
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
export class SearchUserComponent extends AbstractSearchListComponent implements OnInit {
	abstractList: User[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setSkeleton(): void {
		this.abstractList = this.skeletonService.getUserList();
		this.abstractListSkeletonToggle = true;
		this.abstractListHasMore = false;
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.getAbstractList();
		}
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

	getAbstractList(concat: boolean = false): void {
		this.abstractListIsLoading$.next(true);

		let userGetAllDto: UserGetAllDto = {
			page: this.abstractPage || this.abstractPageDefault,
			size: this.abstractSize || this.abstractSizeDefault
		};

		userGetAllDto = {
			...this.getAbstractListSearchGetAllDto(userGetAllDto)
		};

		// Search

		if (!concat) {
			this.setSkeleton();
		}

		this.abstractListRequest$?.unsubscribe();
		this.abstractListRequest$ = this.userService.getAll(userGetAllDto).subscribe({
			next: (userList: User[]) => {
				this.abstractList = concat ? this.abstractList.concat(userList) : userList;
				this.abstractListSkeletonToggle = false;
				this.abstractListHasMore = userList.length === this.abstractSize;
				this.abstractListIsLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
