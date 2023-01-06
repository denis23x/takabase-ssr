/** @format */

import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import { AuthService, User } from '../../../core';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-window, [appWindow]',
	templateUrl: 'window.component.html'
})
export class WindowComponent implements OnInit, OnDestroy {
	@Input()
	set appTitle(title: string) {
		this.title = title;
	}

	@Output() closed: EventEmitter<void> = new EventEmitter<void>();

	title: string | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => (this.authUser = user),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.authUser$].forEach($ => $?.unsubscribe());
	}
}
