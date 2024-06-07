/** @format */

import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';
import { AuthorizationService } from './core/services/authorization.service';
import { filter, first, switchMap } from 'rxjs/operators';
import { CurrentUser } from './core/models/current-user.model';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { SnackbarComponent } from './standalone/components/snackbar/snackbar.component';
import { HeaderComponent } from './standalone/components/header/header.component';
import { ScrollToTopComponent } from './standalone/components/scroll-to-top/scroll-to-top.component';
import { ReportComponent } from './standalone/components/report/report.component';
import { PlatformService } from './core/services/platform.service';
import { CookiesComponent } from './standalone/components/cookies/cookies.component';

@Component({
	standalone: true,
	imports: [RouterModule, SnackbarComponent, HeaderComponent, ScrollToTopComponent, ReportComponent, CookiesComponent],
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
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
		}
	}

	ngAfterViewInit(): void {
		// TODO: update set loader
		this.appearanceService.setLoader(false);
	}

	ngOnDestroy(): void {
		[this.currentUser$].forEach(($: Subscription) => $?.unsubscribe());
	}
}
