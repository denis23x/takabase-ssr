/** @format */

import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { filter, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';
import { nanoid } from 'nanoid';
import type { CurrentUser } from '../models/current-user.model';

export function CurrentUserMixin<T extends new (...args: any[]) => any>(MasterClass: T) {
	@Component({
		selector: 'app-current-user-mixin',
		template: '',
		host: {
			hostID: nanoid()
		}
	})
	abstract class SlaveClass extends MasterClass implements OnInit, OnDestroy {
		public readonly authorizationService: AuthorizationService = inject(AuthorizationService);
		public readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

		currentUser: CurrentUser | null;
		currentUser$: Subscription | undefined;

		currentUserSkeletonToggle: boolean = true;
		currentUserSkeletonToggle$: Subscription | undefined;

		ngOnInit(): void {
			super.ngOnInit && super.ngOnInit();

			// ngOnInit

			this.currentUser$?.unsubscribe();
			this.currentUser$ = this.authorizationService
				.getCurrentUser()
				.pipe(
					tap((currentUser: CurrentUser | null) => (this.currentUser = currentUser)),
					filter((currentUser: CurrentUser | null) => !!currentUser)
				)
				.subscribe({
					next: () => this.ngOnCurrentUserIsReady && this.ngOnCurrentUserIsReady(),
					error: (error: any) => console.error(error)
				});

			this.currentUserSkeletonToggle$?.unsubscribe();
			this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
				.pipe(
					filter((currentUserIsPopulated: boolean) => currentUserIsPopulated),
					tap(() => (this.currentUserSkeletonToggle = false))
				)
				.subscribe({
					next: () => this.changeDetectorRef.markForCheck(),
					error: (error: any) => console.error(error)
				});
		}

		ngOnDestroy(): void {
			super.ngOnDestroy && super.ngOnDestroy();

			// ngOnDestroy

			[this.currentUser$, this.currentUserSkeletonToggle$].forEach(($: Subscription) => $?.unsubscribe());
		}
	}

	return SlaveClass;
}
