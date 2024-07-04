/** @format */

import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CookiesService } from '../services/cookies.service';
import { AppearanceService } from '../services/appearance.service';
import { nanoid } from 'nanoid';

export function InfiniteScrollMixin<T extends new (...args: any[]) => any>(MasterClass: T) {
	@Component({
		selector: 'app-infinite-scroll-mixin',
		template: '',
		host: {
			hostID: nanoid()
		}
	})
	abstract class SlaveClass extends MasterClass implements OnInit, OnDestroy {
		private readonly cookiesService: CookiesService = inject(CookiesService);
		private readonly appearanceService: AppearanceService = inject(AppearanceService);

		postListIsHasMore: boolean = false;
		postListIsLoading: WritableSignal<boolean> = signal(false);
		postListPageScrollInfinite: boolean = false;
		postListPageScrollInfinite$: Subscription | undefined;

		ngOnInit(): void {
			super.ngOnInit && super.ngOnInit();

			// ngOnInit

			this.postListPageScrollInfinite = !!Number(this.cookiesService.getItem('page-scroll-infinite'));

			if (this.postListPageScrollInfinite) {
				this.postListPageScrollInfinite$?.unsubscribe();
				this.postListPageScrollInfinite$ = this.appearanceService
					.getPageScrollInfinite()
					.pipe(filter(() => this.postListIsHasMore && !this.postListIsLoading()))
					.subscribe({
						next: () => this.getPostList(true),
						error: (error: any) => console.error(error)
					});
			}
		}

		ngOnDestroy(): void {
			super.ngOnDestroy && super.ngOnDestroy();

			// ngOnDestroy

			[this.postListPageScrollInfinite$].forEach(($: Subscription) => $?.unsubscribe());
		}
	}

	return SlaveClass;
}
