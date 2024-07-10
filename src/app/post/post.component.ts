/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Post } from '../core/models/post.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PostStore } from './post.store';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { TitleService } from '../core/services/title.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { filter } from 'rxjs/operators';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { SkeletonService } from '../core/services/skeleton.service';

@Component({
	standalone: true,
	imports: [RouterModule, CommonModule, SvgIconComponent, SkeletonDirective],
	selector: 'app-post',
	templateUrl: './post.component.html'
})
export class PostComponent implements OnInit, OnDestroy {
	private readonly titleService: TitleService = inject(TitleService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postStore: PostStore = inject(PostStore);

	post: Post | undefined;
	post$: Subscription | undefined;
	postSkeletonToggle: boolean = true;

	ngOnInit(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		[this.post$].forEach(($: Subscription) => $?.unsubscribe());

		// Reset store

		this.postStore.reset();
	}

	setSkeleton(): void {
		this.post = this.skeletonService.getPost(['user', 'category']);
		this.postSkeletonToggle = true;
	}

	setResolver(): void {
		this.post$ = this.postStore
			.getPost()
			.pipe(filter((post: Post | undefined) => !!post))
			.subscribe({
				next: (post: Post) => {
					this.post = post;
					this.postSkeletonToggle = false;

					/** Apply SEO meta tags */

					this.setMetaTags();
					this.setTitle();
				},
				error: (error: any) => console.error(error)
			});
	}

	setTitle(): void {
		this.titleService.setTitle(this.post.name);
	}

	setMetaTags(): void {
		this.metaService.getMetaImageDownloadURL(this.post.image).subscribe({
			next: (downloadURL: string | null) => {
				const title: string = this.post.name;
				const description: string = this.post.description;

				const metaOpenGraph: MetaOpenGraph = {
					['og:title']: title,
					['og:description']: description,
					['og:type']: 'article',
					['article:published_time']: this.post.createdAt,
					['article:modified_time']: this.post.updatedAt,
					['article:author']: this.post.user.name,
					['article:section']: this.post.category.name,
					['og:image']: downloadURL,
					['og:image:alt']: this.post.name,
					['og:image:type']: 'image/webp'
				};

				const metaTwitter: MetaTwitter = {
					['twitter:title']: title,
					['twitter:description']: description,
					['twitter:image']: downloadURL,
					['twitter:image:alt']: this.post.name
				};

				this.metaService.setMeta(metaOpenGraph, metaTwitter);
			},
			error: (error: any) => console.error(error)
		});
	}
}
