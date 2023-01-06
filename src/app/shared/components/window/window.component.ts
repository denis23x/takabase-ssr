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
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-window, [appWindow]',
	templateUrl: 'window.component.html'
})
export class WindowComponent implements OnInit, OnDestroy {
	@Input()
	set appTitle(title: string) {
		this.captionTitle = title;
	}

	@Input()
	set appButtons(buttonsList: string[]) {
		this.captionButtonsList = buttonsList;
	}

	@Output() closed: EventEmitter<void> = new EventEmitter<void>();

	captionTitle: string | undefined;
	captionButtonsList: string[] = ['close'];
	captionButtonsPosition: string = 'left';

	fullscreenToggle: boolean = false;
	fullscreenClassList: string[] = [];

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.onFullscreen(false);

		this.authUser$ = this.authService.user
			.pipe(filter((user: User) => !!user))
			.subscribe({
				next: (user: User) => {
					this.authUser = user;

					this.captionButtonsPosition = this.authUser.settings.buttons;
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.authUser$].forEach($ => $?.unsubscribe());
	}

	onClose(): void {
		this.closed.emit();
	}

	onFullscreen(toggle: boolean): void {
		this.fullscreenToggle = toggle;

		if (this.fullscreenToggle) {
			this.fullscreenClassList = ['w-full', 'h-full', 'justify-between'];
		} else {
			this.fullscreenClassList = [
				'left-4',
				'top-1/2',
				'h-auto',
				'max-h-[calc(100vh-2rem)]',
				'w-full',
				'max-w-[calc(100vw-2rem)]',
				'-translate-y-1/2',
				'border',
				'border-base-content/20',
				'md:left-1/2',
				'md:max-h-[75vh]',
				'md:max-w-[640px]',
				'md:-translate-x-1/2',
				'shadow-xl',
				'rounded-box'
			];
		}
	}
}
