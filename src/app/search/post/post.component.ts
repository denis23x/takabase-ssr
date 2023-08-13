/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { PostCardComponent } from '../../standalone/components/post/card/card.component';
import { AbstractListComponent } from '../../abstracts/abstract-list.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';

// prettier-ignore
@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, PostCardComponent],
	selector: 'app-search-post',
	templateUrl: './post.component.html'
})
export class SearchPostComponent extends AbstractListComponent implements OnInit {
	abstractList: Post[] = [];

	ngOnInit(): void {
		super.ngOnInit();

    /** Apply SEO meta tags */

    this.setMetaTags();
	}

  setMetaTags(): void {
    const title: string = 'Search posts';

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

		let postGetAllDto: PostGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize,
			scope: ['user', 'category']
		};

		// prettier-ignore
		postGetAllDto = {
		  ...this.postService.getSearchPostGetAllDto(postGetAllDto, this.activatedRoute.snapshot)
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
