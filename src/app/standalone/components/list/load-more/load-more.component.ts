/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { CookiesService } from '../../../../core/services/cookies.service';
import { PlatformService } from '../../../../core/services/platform.service';
import { DOCUMENT } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { RouterModule } from '@angular/router';
import { ListMockComponent } from '../mock/mock.component';
import { PlatformDirective } from '../../../directives/app-platform.directive';
import type { User } from '../../../../core/models/user.model';
import type { Category } from '../../../../core/models/category.model';
import type { Post } from '../../../../core/models/post.model';
import type { SearchResponse } from '@algolia/client-search';

interface Pagination {
	isOnePage?: boolean;
	isEndPage?: boolean;
}

@Component({
	standalone: true,
	selector: 'app-list-load-more, [appListLoadMore]',
	imports: [RouterModule, SvgIconComponent, ListMockComponent, PlatformDirective],
	templateUrl: './load-more.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListLoadMoreComponent implements OnInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly platformService: PlatformService = inject(PlatformService);

	@Output() appLoadMoreToggle: EventEmitter<void> = new EventEmitter<void>();

	@Input({ required: true })
	set appListLoadMoreIsLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	@Input({ required: true })
	set appListLoadMoreSearchResponse(searchResponse: Omit<SearchResponse<Post | Category | User>, 'hits'> & Pagination) {
		// prettier-ignore
		if (searchResponse) {
			this.searchResponseIsOnePage = searchResponse.isOnePage || (searchResponse.nbPages === 1 || searchResponse.nbPages === 0);
			this.searchResponseIsEndPage = searchResponse.isEndPage || (searchResponse.nbPages === searchResponse.page + 1 || searchResponse.nbPages === 0);
		}
	}

	windowScroll$: Subscription | undefined;
	windowScrollPageInfinite: boolean = false;

	isLoading: boolean = false;

	searchResponseIsOnePage: boolean = false;
	searchResponseIsEndPage: boolean = false;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			if (!!Number(this.cookiesService.getItem('page-scroll-infinite'))) {
				this.windowScrollPageInfinite = true;

				this.windowScroll$?.unsubscribe();
				this.windowScroll$ = fromEvent(window, 'scroll')
					.pipe(
						map(() => window.innerHeight + Math.round(window.scrollY)),
						filter((scrollY: number) => Math.abs(scrollY - this.document.body.offsetHeight) <= 96 + 64),
						filter(() => !this.searchResponseIsEndPage && !this.isLoading),
						debounceTime(300)
					)
					.subscribe({
						next: () => this.onLoadMore(),
						error: (error: any) => console.error(error)
					});
			}
		}
	}

	ngOnDestroy(): void {
		[this.windowScroll$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onLoadMore(): void {
		this.appLoadMoreToggle.emit();
	}
}
