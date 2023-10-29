/** @format */

import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthorizationService } from '../../core/services/authorization.service';
import { CurrentUser } from '../../core/models/current-user.model';

@Directive({
	standalone: true,
	selector: '[appAuthenticated]'
})
export class AppAuthenticatedDirective implements OnInit, OnDestroy {
	@Input()
	set appAuthenticated(authenticated: boolean) {
		this.authenticated = authenticated;
	}

	authenticated$: Subscription | undefined;
	authenticated: boolean = false;

	constructor(
		private templateRef: TemplateRef<any>,
		private authorizationService: AuthorizationService,
		private viewContainerRef: ViewContainerRef
	) {}

	ngOnInit(): void {
		this.authenticated$ = this.authorizationService
			.getCurrentUser()
			.pipe(tap(() => this.viewContainerRef.clear()))
			.subscribe({
				next: (currentUser: CurrentUser | undefined) => {
					if ((!!currentUser && this.authenticated) || (!currentUser && !this.authenticated)) {
						this.viewContainerRef.createEmbeddedView(this.templateRef);
					} else {
						this.viewContainerRef.clear();
					}
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.authenticated$].forEach(($: Subscription) => $?.unsubscribe());
	}
}
