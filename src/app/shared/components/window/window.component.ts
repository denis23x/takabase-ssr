/** @format */

import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent],
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
	fullscreenClassList: string[] = [
		'top-1/2',
		'left-1/2',
		'h-auto',
		'w-auto',
		'max-h-[calc(100vh-2rem)]',
		'max-w-[calc(100vw-2rem)]',
		'-translate-y-1/2',
		'-translate-x-1/2',
		'border',
		'border-base-content/20',
		'md:max-h-[80vh]',
		'md:max-w-[calc(768px-4rem)]',
		'shadow-xl',
		'rounded-box'
	];

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
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
				'top-1/2',
				'left-1/2',
				'h-auto',
				'w-auto',
				'max-h-[calc(100vh-2rem)]',
				'max-w-[calc(100vw-2rem)]',
				'-translate-y-1/2',
				'-translate-x-1/2',
				'border',
				'border-base-content/20',
				'md:max-h-[80vh]',
				'md:max-w-[calc(768px-4rem)]',
				'shadow-xl',
				'rounded-box'
			];
		}
	}
}
