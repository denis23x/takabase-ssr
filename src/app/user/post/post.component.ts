/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Data, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { AbstractListComponent } from '../../abstracts/abstract-list.component';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { User } from '../../core/models/user.model';
import { Category } from '../../core/models/category.model';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TitleService } from '../../core/services/title.service';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, CardPostComponent, SvgIconComponent],
	selector: 'app-user-post',
	templateUrl: './post.component.html'
})
export class UserPostComponent extends AbstractListComponent implements OnInit, OnDestroy {
	/** https://unicorn-utterances.com/posts/angular-extend-class */

	private titleService: TitleService = inject(TitleService);

	activatedRouteParentData$: Subscription | undefined;
	activatedRouteUrl$: Subscription | undefined;

	abstractList: Post[] = [];

	user: User | undefined;

	category: Category | undefined;
	categoryList: Category[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		this.activatedRouteParentData$ = this.activatedRoute.parent.data.pipe(map((data: Data) => data.data)).subscribe({
			next: ([user, categoryList]: [User, Category[]]) => {
				this.user = user;

				this.categoryList = categoryList;

				this.activatedRouteUrl$?.unsubscribe();
				this.activatedRouteUrl$ = this.activatedRoute.url.subscribe({
					next: () => {
						this.category = this.categoryList.find((category: Category) => {
							return category.id === Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));
						});

						/** Apply skeleton */

						this.abstractList = this.skeletonService.getPostList(this.abstractSize);
						this.abstractListSkeletonToggle = true;
						this.abstractListHasMore = false;

						this.getAbstractList();

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

	ngOnDestroy(): void {
		super.ngOnDestroy();

		[this.activatedRouteData$, this.activatedRouteUrl$].forEach(($: Subscription) => $?.unsubscribe());
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
		this.abstractListLoading$.next(true);

		/** Request */

		let postGetAllDto: PostGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize
		};

		postGetAllDto = {
			...this.postService.getUserPostGetAllDto(postGetAllDto, this.activatedRoute.snapshot)
		};

		this.postService.getAll(postGetAllDto).subscribe({
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
