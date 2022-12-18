/** @format */

import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { toSvg } from 'jdenticon';
import { User, PlatformService } from '../../../core';
import { BehaviorSubject, fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

@Component({
	selector: 'app-avatar, [appAvatar]',
	templateUrl: './avatar.component.html'
})
export class AvatarComponent implements OnInit, OnDestroy {
	@Input()
	set appUser(user: User) {
		this.user$.next(user);
	}

	constructor(
		private platformService: PlatformService,
		private elementRef: ElementRef
	) {}

	// prettier-ignore
	user$: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);
	userSubscription$: Subscription | undefined;

	avatar: string | undefined;
	avatarClassList: string[] = ['w-12', 'h-12', 'rounded-full'];
	avatarSize: number = 48;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			// TODO: update resize

			this.userSubscription$ = merge(
				this.user$
				// fromEvent(window, 'resize').pipe(
				//   filter(() => {
				//     return this.avatarSize !== this.elementRef.nativeElement.clientWidth;
				//   })
				// )
			)
				.pipe(debounceTime(10))
				.subscribe({
					next: () => {
						// this.avatarSize = this.elementRef.nativeElement.clientWidth;
						this.avatar = this.user$.getValue().avatar
							? this.getAvatar()
							: this.getJdenticon();
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		[this.userSubscription$].forEach($ => $?.unsubscribe());
	}

	getAvatar(): string {
		const user: User = this.user$.getValue();

		return `
      <img
        loading="lazy"
        width="${this.avatarSize}"
        height="${this.avatarSize}"
        src="${user.avatar}"
        alt="${user.name}"
      >
    `;
	}

	getJdenticon(): string {
		const user: User = this.user$.getValue();

		return toSvg(user.name, this.avatarSize, {
			backColor: '#00000000',
			padding: 0
		});
	}
}
