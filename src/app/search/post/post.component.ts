/** @format */

import {
	Component,
	OnDestroy,
	OnInit,
	makeStateKey,
	StateKey,
	Input,
	numberAttribute,
	inject,
	TransferState
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { BehaviorSubject, distinctUntilKeyChanged, from, Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { MetaService } from '../../core/services/meta.service';
import { AlgoliaService } from '../../core/services/algolia.service';
import { PlatformService } from '../../core/services/platform.service';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';

const searchResponseKey: StateKey<SearchResponse<Post>> = makeStateKey<SearchResponse<Post>>('searchResponse');

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		SvgIconComponent,
		CardPostComponent,
		SkeletonDirective,
		AdComponent,
		ListLoadMoreComponent,
		ListMockComponent
	],
	selector: 'app-search-post',
	templateUrl: './post.component.html'
})
export class SearchPostComponent implements OnInit, OnDestroy {
	public readonly skeletonService: SkeletonService = inject(SkeletonService);
	public readonly metaService: MetaService = inject(MetaService);
	public readonly router: Router = inject(Router);
	public readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	public readonly algoliaService: AlgoliaService = inject(AlgoliaService);
	public readonly platformService: PlatformService = inject(PlatformService);
	public readonly transferState: TransferState = inject(TransferState);

	@Input({ transform: numberAttribute })
	set deleteId(deleteId: number | undefined) {
		if (deleteId) {
			this.router
				.navigate([], {
					queryParams: {
						...this.activatedRoute.snapshot.queryParams,
						deleteId: null
					},
					queryParamsHandling: 'merge',
					relativeTo: this.activatedRoute,
					replaceUrl: true
				})
				.then(() => (this.postList = this.postList.filter((post: Post) => post.id !== deleteId)));
		}
	}

	activatedRouteQueryParams$: Subscription | undefined;

	postList: Post[] = [];
	postListSkeletonToggle: boolean = true;
	postListRequest$: Subscription | undefined;
	postGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	postListSearchResponse: Omit<SearchResponse<Post>, 'hits'> | undefined;
	postListIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	ngOnInit(): void {
		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.pipe(distinctUntilKeyChanged('query')).subscribe({
			next: () => {
				if (this.transferState.hasKey(searchResponseKey)) {
					this.setPostListSearchResponse(this.transferState.get(searchResponseKey, null));

					if (this.platformService.isBrowser()) {
						this.transferState.remove(searchResponseKey);
					}
				} else {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				}
			},
			error: (error: any) => console.error(error)
		});

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.activatedRouteQueryParams$, this.postListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;
	}

	setResolver(): void {
		this.getPostList();
	}

	setMetaTags(): void {
		const title: string = 'Search posts';
		const description: string = "Use the search to find what you're looking for";

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

	/** PostList */

	getPostList(postListLoadMore: boolean = false): void {
		this.postListIsLoading$.next(true);

		/** Algolia */

		const postQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postIndex: SearchIndex = this.algoliaService.getSearchIndex('post');
		const postIndexSearch: SearchOptions = {
			page: (() => (this.postGetAllDto.page = postListLoadMore ? this.postGetAllDto.page + 1 : 0))(),
			hitsPerPage: this.postGetAllDto.size
		};

		this.postListRequest$?.unsubscribe();
		this.postListRequest$ = from(postIndex.search(postQuery, postIndexSearch)).subscribe({
			next: (searchResponse: SearchResponse<any>) => {
				this.setPostListSearchResponse(searchResponse);

				if (this.platformService.isServer()) {
					this.transferState.set(searchResponseKey, searchResponse);
				}
			},
			error: (error: any) => console.error(error)
		});
	}

	setPostListSearchResponse(searchResponse: SearchResponse<Post> | null): void {
		const { hits: postList, ...postListSearchResponse }: any = searchResponse;

		// Set

		this.postList = searchResponse.page > 0 ? this.postList.concat(postList) : postList;
		this.postListSearchResponse = postListSearchResponse;
		this.postListSkeletonToggle = false;
		this.postListIsLoading$.next(false);
	}
}
