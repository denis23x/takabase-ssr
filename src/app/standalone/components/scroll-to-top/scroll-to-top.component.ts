/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ViewportScroller, Location } from '@angular/common';
import { distinctUntilChanged, fromEvent, of, Subscription, switchMap } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { PlatformService } from '../../../core/services/platform.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { CookiesService } from '../../../core/services/cookies.service';

@Component({
	standalone: true,
	selector: 'app-scroll-to-top, [appScrollToTop]',
	imports: [SvgIconComponent],
	templateUrl: './scroll-to-top.component.html'
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly viewportScroller: ViewportScroller = inject(ViewportScroller);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly location: Location = inject(Location);

	windowScroll$: Subscription | undefined;

	windowScrollToTopToggleValue: number = 100;
	windowScrollToTopToggle: boolean = false;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			this.location.onUrlChange(() => {
				this.windowScrollToTopToggleValue = window.innerHeight * 2;
				this.windowScroll$?.unsubscribe();

				// prettier-ignore
				const pageScrollToTop: boolean = !!Number(this.cookiesService.getItem('page-scroll-to-top'));

				if (pageScrollToTop) {
					// Not affecting hydration

					this.windowScroll$ = fromEvent(window, 'scroll')
						.pipe(
							debounceTime(10),
							map(() => this.viewportScroller.getScrollPosition().pop()),
							switchMap((y: number) => of(y > this.windowScrollToTopToggleValue)),
							distinctUntilChanged()
						)
						.subscribe({
							next: (toggle: boolean) => (this.windowScrollToTopToggle = toggle),
							error: (error: any) => console.error(error)
						});
				}
			});
		}
	}

	ngOnDestroy(): void {
		[this.windowScroll$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onScrollToTop(): void {
		this.viewportScroller.scrollToPosition([0, 0]);
	}
}
