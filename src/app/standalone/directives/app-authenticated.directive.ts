/** @format */

import {
	Directive,
	inject,
	Input,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthorizationService } from '../../core/services/authorization.service';
import { CurrentUser } from '../../core/models/current-user.model';

@Directive({
	standalone: true,
	selector: '[appAuthenticated]'
})
export class AuthenticatedDirective implements OnInit, OnDestroy {
	private readonly templateRef: TemplateRef<any> = inject(TemplateRef);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

	@Input({ required: true })
	set appAuthenticated(authenticated: boolean) {
		this.authenticated = authenticated;
	}

	authenticated$: Subscription | undefined;
	authenticated: boolean = false;

	ngOnInit(): void {
		this.authenticated$?.unsubscribe();
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
