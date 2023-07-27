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
import { AbstractListComponent } from '../../standalone/abstracts/abstract-list.component';

// prettier-ignore
@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AvatarComponent,
		SvgIconComponent,
		UserUrlPipe,
		DayjsPipe
	],
	selector: 'app-search-user',
	templateUrl: './user.component.html'
})
export class SearchUserComponent extends AbstractListComponent implements OnInit {
	abstractList: User[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Meta */

		const title: string = 'Search users';

		// prettier-ignore
		const description: string = 'Use our search function to find what you\'re looking for on Draft';

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

	getAbstractList(concat: boolean): void {
		this.abstractListLoading$.next(true);

		/** Request */

		let userGetAllDto: UserGetAllDto = {
			page: this.page,
			size: this.size
		};

		// prettier-ignore
		const name: string = String(this.activatedRoute.parent.snapshot.queryParamMap.get('query') || '');

		if (name.length) {
			userGetAllDto = {
				...userGetAllDto,
				name
			};
		}

		this.userService.getAll(userGetAllDto).subscribe({
			next: (userList: User[]) => {
				this.abstractList = concat ? this.abstractList.concat(userList) : userList;
				this.abstractListHasMore = userList.length === this.size;
				this.abstractListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
