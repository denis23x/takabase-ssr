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
import { BehaviorSubject, Subscription } from 'rxjs';
import { TitleService } from '../../core/services/title.service';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { filter } from 'rxjs/operators';

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

	user: User | undefined;
	user$: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);

	category: Category | undefined;
	categoryList: Category[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		[this.activatedRouteUrl$].forEach(($: Subscription) => $?.unsubscribe());

		[this.user$].forEach(($: BehaviorSubject<User | undefined>) => $?.complete());
	}

	setSkeleton(): void {
		this.abstractList = this.skeletonService.getPostList();
		this.abstractListSkeletonToggle = true;
		this.abstractListHasMore = false;
	}

	setResolver(): void {
		this.user$
			.pipe(
				filter(() => this.platformService.isBrowser()),
				filter((user: User | undefined) => !!user)
			)
			.subscribe({
				next: (user: User) => {
					this.user = user;
					this.categoryList = this.user.categories;

					/** Apply skeleton */

					this.setSkeleton();

					this.activatedRouteUrl$?.unsubscribe();
					this.activatedRouteUrl$ = this.activatedRoute.url.subscribe({
						next: () => {
							// prettier-ignore
							this.category = this.categoryList.find((category: Category) => {
								return category.id === Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));
							});

							/** Apply skeleton */

							this.setSkeleton();

							/** Request */

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
		this.abstractList$?.unsubscribe();
		this.abstractListLoading$.next(true);

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
			...this.postService.getSearchPostGetAllDto(postGetAllDto, this.activatedRoute.snapshot)
		};

		this.abstractList$ = this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.abstractList = concat ? this.abstractList.concat(postList) : postList;
				this.abstractListSkeletonToggle = false;
				this.abstractListHasMore = postList.length === this.abstractSize;
				this.abstractListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
