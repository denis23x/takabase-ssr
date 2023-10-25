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

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AvatarComponent,
		SvgIconComponent,
		UserUrlPipe,
		DayjsPipe,
		CardUserComponent
	],
	selector: 'app-search-user',
	templateUrl: './user.component.html'
})
export class SearchUserComponent extends AbstractSearchListComponent implements OnInit {
	abstractList: User[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply skeleton */

		this.abstractList = this.skeletonService.getUserList(this.abstractSize);
		this.abstractListSkeletonToggle = true;
		this.abstractListHasMore = false;

		if (this.platformService.isBrowser()) {
			this.getAbstractList();
		}

		/** Apply SEO meta tags */

		this.setMetaTags();
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
		this.abstractListLoading$.next(true);

		/** Request */

		let userGetAllDto: UserGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize
		};

		userGetAllDto = {
			...this.postService.getSearchPostGetAllDto(userGetAllDto, this.activatedRoute.snapshot)
		};

		this.userService.getAll(userGetAllDto).subscribe({
			next: (userList: User[]) => {
				this.abstractList = concat ? this.abstractList.concat(userList) : userList;
				this.abstractListSkeletonToggle = false;
				this.abstractListHasMore = userList.length === this.abstractSize;
				this.abstractListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
