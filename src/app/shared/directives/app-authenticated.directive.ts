/** @format */

import {
	Directive,
	Input,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../core';
import { tap } from 'rxjs/operators';

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
		private authService: AuthService,
		private viewContainerRef: ViewContainerRef
	) {}

	ngOnInit(): void {
		this.authenticated$ = this.authService.user
			.pipe(tap(() => this.viewContainerRef.clear()))
			.subscribe({
				next: (user: User | undefined) => {
					if (
						(!!user && this.authenticated) ||
						(!user && !this.authenticated)
					) {
						this.viewContainerRef.createEmbeddedView(this.templateRef);
					} else {
						this.viewContainerRef.clear();
					}
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.authenticated$].forEach($ => $?.unsubscribe());
	}
}
