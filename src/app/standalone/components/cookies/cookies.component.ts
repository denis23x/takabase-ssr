/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { RouterModule } from '@angular/router';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CookiesService } from '../../../core/services/cookies.service';
import dayjs from 'dayjs/esm';
import type { CurrentUser } from '../../../core/models/current-user.model';

@Component({
	standalone: true,
	selector: 'app-cookies, [appCookies]',
	imports: [RouterModule, SvgIconComponent],
	templateUrl: './cookies.component.html'
})
export class CookiesComponent implements OnInit, OnDestroy {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly cookiesService: CookiesService = inject(CookiesService);

	currentUser: CurrentUser | null;
	currentUser$: Subscription | undefined;

	currentUserIsPopulatedToggle: boolean = false;
	currentUserIsPopulatedToggle$: Subscription | undefined;

	currentUserIsAcceptedCookies: boolean = false;

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | null) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		this.currentUserIsPopulatedToggle$?.unsubscribe();
		this.currentUserIsPopulatedToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserIsPopulatedToggle = true),
				error: (error: any) => console.error(error)
			});

		this.currentUserIsAcceptedCookies = !!Number(this.cookiesService.getItem('cookies-accepted'));
	}

	ngOnDestroy(): void {
		[this.currentUser$, this.currentUserIsPopulatedToggle$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onSubmit(): void {
		this.cookiesService.setItem('cookies-accepted', '1', {
			expires: dayjs('2077-06-12').toDate()
		});

		this.currentUserIsAcceptedCookies = true;
	}
}
