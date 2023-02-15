/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import { map, skip, tap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
	User,
	UserService,
	UserGetAllDto,
	MetaService,
	MetaOpenGraph,
	MetaTwitter
} from '../../core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';
import { UserUrlPipe } from '../../shared/pipes/user-url.pipe';
import { DayjsPipe } from '../../shared/pipes/dayjs.pipe';

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
export class SearchUserComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	page: number = 1;
	size: number = 20;

	userList: User[] = [];
	userListHasMore: boolean = false;

	// prettier-ignore
	userListLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private userService: UserService,
		private metaService: MetaService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (userList: User[]) => {
					this.userList = userList;
					this.userListHasMore = userList.length === this.size;
				},
				error: (error: any) => console.error(error)
			});

		this.activatedRouteQueryParams$ = this.activatedRoute.parent.queryParams
			.pipe(
				skip(1),
				tap(() => {
					this.page = 1;
					this.size = 20;

					this.userList = [];
					this.userListHasMore = false;

					this.userListLoading.next(true);
				})
			)
			.subscribe({
				next: () => this.getUserList(false),
				error: (error: any) => console.error(error)
			});

		this.setMeta();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
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

	getUserList(concat: boolean): void {
		let userGetAllDto: UserGetAllDto = {
			page: this.page,
			size: this.size
		};

		// prettier-ignore
		const name: string = String(this.activatedRoute.parent.snapshot.queryParamMap.get('query') || '');

		if (!!name.length) {
			userGetAllDto = {
				...userGetAllDto,
				name
			};
		}

		this.userService.getAll(userGetAllDto).subscribe({
			next: (userList: User[]) => {
				this.userList = concat ? this.userList.concat(userList) : userList;
				this.userListHasMore = userList.length === this.size;

				this.userListLoading.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}

	onUserListLoadMore(): void {
		this.page++;

		this.getUserList(true);
	}
}
