/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { distinctUntilChanged, fromEvent, of, Subscription, switchMap } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { PlatformService } from '../../../core/services/platform.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { CookiesService } from '../../../core/services/cookies.service';

@Component({
	standalone: true,
	selector: 'app-scroll-up, [appScrollUp]',
	imports: [SvgIconComponent],
	templateUrl: './scroll-up.component.html'
})
export class ScrollUpComponent implements OnInit, OnDestroy {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly viewportScroller: ViewportScroller = inject(ViewportScroller);
	private readonly cookiesService: CookiesService = inject(CookiesService);

	windowScroll$: Subscription | undefined;

	windowScrollUpToggleValue: number = 100;
	windowScrollUpToggle: boolean = false;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			if (!!Number(this.cookiesService.getItem('page-scroll-up'))) {
				this.windowScroll$?.unsubscribe();
				this.windowScroll$ = fromEvent(window, 'scroll')
					.pipe(
						debounceTime(10),
						tap(() => (this.windowScrollUpToggleValue = window.innerHeight * 2)),
						map(() => this.viewportScroller.getScrollPosition().pop()),
						switchMap((y: number) => of(y > this.windowScrollUpToggleValue)),
						distinctUntilChanged()
					)
					.subscribe({
						next: (toggle: boolean) => (this.windowScrollUpToggle = toggle),
						error: (error: any) => console.error(error)
					});
			}
		}
	}

	ngOnDestroy(): void {
		[this.windowScroll$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onScrollUp(): void {
		this.viewportScroller.scrollToPosition([0, 0]);
	}
}
