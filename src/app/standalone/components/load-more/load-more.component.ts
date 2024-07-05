/** @format */

import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { CookiesService } from '../../../core/services/cookies.service';
import { PlatformService } from '../../../core/services/platform.service';
import { DOCUMENT } from '@angular/common';
import { SearchResponse } from '@algolia/client-search';
import { Category } from '../../../core/models/category.model';
import { Post } from '../../../core/models/post.model';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { RouterModule } from '@angular/router';
import { User } from '../../../core/models/user.model';

@Component({
	standalone: true,
	selector: 'app-load-more, [appLoadMore]',
	imports: [RouterModule, SvgIconComponent],
	templateUrl: './load-more.component.html'
})
export class LoadMoreComponent implements OnInit, OnDestroy {
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly document: Document = inject(DOCUMENT);

	@Output() appLoadMoreToggle: EventEmitter<void> = new EventEmitter<void>();

	@Input({ required: true })
	set appLoadMoreSearchResponseIsLoading(searchResponseIsLoading: boolean) {
		this.searchResponseIsLoading = searchResponseIsLoading;
	}

	@Input({ required: true })
	set appLoadMoreSearchResponse(searchResponse: Omit<SearchResponse<Post | Category | User>, 'hits'> | undefined) {
		if (searchResponse) {
			this.searchResponse = searchResponse;
			this.searchResponseIsOnePage = searchResponse.nbPages === 1 || searchResponse.nbPages === 0;
			this.searchResponseIsEndPage = searchResponse.nbPages === searchResponse.page + 1 || searchResponse.nbPages === 0;
		}
	}

	windowScroll$: Subscription | undefined;
	windowScrollPageInfinite: boolean = false;

	searchResponse: Omit<SearchResponse<Post | Category | User>, 'hits'> | undefined;
	searchResponseIsLoading: boolean = false;
	searchResponseIsOnePage: boolean = false;
	searchResponseIsEndPage: boolean = false;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			if (!this.searchResponseIsOnePage) {
				if (!!Number(this.cookiesService.getItem('page-scroll-infinite'))) {
					this.windowScrollPageInfinite = true;

					this.windowScroll$?.unsubscribe();
					this.windowScroll$ = fromEvent(window, 'scroll')
						.pipe(
							map(() => window.innerHeight + Math.round(window.scrollY)),
							filter((scrollY: number) => Math.abs(scrollY - this.document.body.offsetHeight) <= 96 + 64),
							filter(() => !this.searchResponseIsEndPage && !this.searchResponseIsLoading),
							debounceTime(300)
						)
						.subscribe({
							next: () => this.onLoadMore(),
							error: (error: any) => console.error(error)
						});
				}
			}
		}
	}

	ngOnDestroy(): void {
		[this.windowScroll$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onLoadMore(): void {
		// Emit load more

		this.appLoadMoreToggle.emit();
	}
}
