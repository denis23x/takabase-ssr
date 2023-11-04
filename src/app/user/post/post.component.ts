/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { AbstractSearchListComponent } from '../../abstracts/abstract-search-list.component';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { User } from '../../core/models/user.model';
import { Category } from '../../core/models/category.model';
import { BehaviorSubject, distinctUntilKeyChanged, Subscription } from 'rxjs';
import { TitleService } from '../../core/services/title.service';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { filter, switchMap, tap } from 'rxjs/operators';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, CardPostComponent, SvgIconComponent],
	selector: 'app-user-post',
	templateUrl: './post.component.html'
})
export class UserPostComponent extends AbstractSearchListComponent implements OnInit, OnDestroy {
	/** https://unicorn-utterances.com/posts/angular-extend-class */

	private titleService: TitleService = inject(TitleService);

	activatedRouteUrl$: Subscription | undefined;

	abstractList: Post[] = [];

	// prettier-ignore
	userComponent$: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);
	user: User | undefined;

	category: Category | undefined;
	categoryList: Category[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.userComponent$
			.pipe(
				tap(() => this.setSkeleton()),
				filter(() => this.platformService.isBrowser()),
				filter((user: User | undefined) => !!user),
				tap((user: User) => {
					this.user = user;
					this.categoryList = this.user.categories;
				})
			)
			.subscribe({
				next: () => {
					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		[this.activatedRouteUrl$].forEach(($: Subscription) => $?.unsubscribe());

		[this.userComponent$].forEach(($: BehaviorSubject<User | undefined>) => $?.complete());
	}

	setSkeleton(): void {
		this.abstractList = this.skeletonService.getPostList();
		this.abstractListSkeletonToggle = true;
		this.abstractListHasMore = false;
	}

	setResolver(): void {
		this.activatedRouteUrl$?.unsubscribe();
		this.activatedRouteUrl$ = this.activatedRoute.url
			.pipe(
				switchMap(() => this.activatedRoute.params),
				distinctUntilKeyChanged('categoryId')
			)
			.subscribe({
				next: () => {
					// prettier-ignore
					const categoryId: number = Number(this.activatedRoute.snapshot.paramMap.get('categoryId') || '');

					this.category = this.categoryList.find((category: Category) => {
						return category.id === categoryId;
					});

					// Set skeleton

					this.setSkeleton();

					// Get abstractList

					if (this.platformService.isBrowser()) {
						this.getAbstractList();
					}

					/** Apply SEO meta tags */

					this.setMetaTags();

					/** Apply title */

					this.setTitle();
				},
				error: (error: any) => console.error(error)
			});
	}

	setTitle(): void {
		this.titleService.setTitle(this.user.name);

		if (this.category) {
			this.titleService.appendTitle(this.category.name);
		}
	}

	setMetaTags(): void {
		const username: string = this.userService.getUserUrl(this.user, 1);
		const title: string = this.category?.name || username;
		const description: string = this.category?.description || this.user.description;

		const metaOpenGraph: Partial<MetaOpenGraph> = {
			['og:title']: title,
			['og:description']: description,
			['og:image']: this.user.avatar,
			['og:image:alt']: username,
			['og:image:type']: 'image/png'
		};

		if (this.category) {
			metaOpenGraph['og:type'] = 'website';
		} else {
			metaOpenGraph['og:type'] = 'profile';
			metaOpenGraph['profile:username'] = username;
		}

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description,
			['twitter:image']: this.user.avatar,
			['twitter:image:alt']: username
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
	}

	getAbstractList(concat: boolean = false): void {
		this.abstractListIsLoading$.next(true);

		let postGetAllDto: PostGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize,
			userId: this.user.id
		};

		if (this.category?.id) {
			postGetAllDto = {
				...postGetAllDto,
				categoryId: this.category.id
			};
		}

		postGetAllDto = {
			...this.searchService.getSearchGetAllDto(postGetAllDto, this.activatedRoute.parent.snapshot)
		};

		if (!concat) {
			this.setSkeleton();
		}

		this.abstractListRequest$?.unsubscribe();
		this.abstractListRequest$ = this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.abstractList = concat ? this.abstractList.concat(postList) : postList;
				this.abstractListSkeletonToggle = false;
				this.abstractListHasMore = postList.length === this.abstractSize;
				this.abstractListIsLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
