/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AppearanceService } from '../core/services/appearance.service';
import { AuthorizationService } from '../core/services/authorization.service';
import { filter, first, switchMap, tap } from 'rxjs/operators';
import { fromEvent, Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { SnackbarComponent } from '../standalone/components/snackbar/snackbar.component';
import { HeaderComponent } from '../standalone/components/header/header.component';
import { ScrollToTopComponent } from '../standalone/components/scroll-to-top/scroll-to-top.component';
import { PlatformService } from '../core/services/platform.service';
import { CookiesComponent } from '../standalone/components/cookies/cookies.component';
import { version } from '../../versions/version';
import { environment } from '../../environments/environment';
import { Location } from '@angular/common';
import { BusService } from '../core/services/bus.service';
import type { CurrentUser } from '../core/models/current-user.model';

@Component({
	standalone: true,
	imports: [RouterModule, SnackbarComponent, HeaderComponent, ScrollToTopComponent, CookiesComponent],
	selector: 'app-outlet',
	templateUrl: './outlet.component.html'
})
export class OutletComponent implements OnInit, OnDestroy {
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly busService: BusService = inject(BusService);
	private readonly location: Location = inject(Location);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	beforeInstallPrompt$: Subscription | undefined;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			/** Populate user */

			this.currentUser$?.unsubscribe();
			this.currentUser$ = this.authorizationService
				.getPopulate()
				.pipe(
					first(),
					filter((currentUser: CurrentUser | undefined) => !!currentUser),
					switchMap((currentUser: CurrentUser) => this.appearanceService.getAppearance(currentUser.firebase.uid))
				)
				.subscribe({
					next: () => console.debug('User populated'),
					error: (error: any) => console.error(error)
				});

			/** Set PWA listener */

			this.beforeInstallPrompt$?.unsubscribe();
			this.beforeInstallPrompt$ = fromEvent(window, 'beforeinstallprompt')
				.pipe(tap((event: Event) => event.preventDefault()))
				.subscribe({
					next: (event: Event) => this.busService.pwaPrompt$.next(event),
					error: (error: any) => console.error(error)
				});

			/** Show version */

			if (environment.production) {
				console.debug(Object.values(version).join(' - '));

				if (this.location.path().includes('debug')) {
					import('eruda').then((eruda: any) => eruda.default.init());
				}
			}
		}
	}

	ngOnDestroy(): void {
		[this.currentUser$, this.beforeInstallPrompt$].forEach(($: Subscription) => $?.unsubscribe());
	}
}
