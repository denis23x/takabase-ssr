/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller, Location } from '@angular/common';
import { distinctUntilChanged, fromEvent, of, Subscription, switchMap } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { PlatformService } from '../../../core/services/platform.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { CookieService } from '../../../core/services/cookie.service';

@Component({
	standalone: true,
	selector: 'app-scroll-to-top, [appScrollToTop]',
	imports: [CommonModule, SvgIconComponent],
	templateUrl: './scroll-to-top.component.html'
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
	windowScroll$: Subscription | undefined;

	windowScrollToTopToggleValue: number = 100;
	windowScrollToTopToggle: boolean = false;

	constructor(
		private platformService: PlatformService,
		private viewportScroller: ViewportScroller,
		private cookieService: CookieService,
		private location: Location
	) {}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			this.location.onUrlChange(() => {
				this.windowScrollToTopToggleValue = window.innerHeight * 2;
				this.windowScroll$?.unsubscribe();

				const pageScrollToTop: boolean = !!Number(this.cookieService.getItem('page-scroll-to-top'));

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
