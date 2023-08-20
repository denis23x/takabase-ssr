/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Data, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { PostCardComponent } from '../../standalone/components/post/card/card.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { AbstractListComponent } from '../../abstracts/abstract-list.component';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { User } from '../../core/models/user.model';
import { Category } from '../../core/models/category.model';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TitleService } from '../../core/services/title.service';

// prettier-ignore
@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, PostCardComponent, SvgIconComponent],
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

    // prettier-ignore
		this.activatedRouteParentData$ = this.activatedRoute.parent.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: ([user, categoryList]: [User, Category[]]) => {
					this.user = user;

					this.categoryList = categoryList;

          this.activatedRouteUrl$?.unsubscribe();
          this.activatedRouteUrl$ = this.activatedRoute.url.subscribe({
            next: () => {
              const categoryId: number = Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));

              this.category = this.categoryList.find((category: Category) => {
                return category.id === Number(categoryId);
              });


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

		// prettier-ignore
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

		// prettier-ignore
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

		// prettier-ignore
		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description,
			['twitter:image']: this.user.avatar,
			['twitter:image:alt']: username
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
	}

	getAbstractList(concat: boolean): void {
		this.abstractListLoading$.next(true);

		/** Request */

		let postGetAllDto: PostGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize
		};

		// prettier-ignore
		postGetAllDto = {
			...this.postService.getUserPostGetAllDto(postGetAllDto, this.activatedRoute.snapshot)
		};

		this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.abstractList = concat ? this.abstractList.concat(postList) : postList;
				this.abstractListHasMore = postList.length === this.abstractSize;
				this.abstractListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
