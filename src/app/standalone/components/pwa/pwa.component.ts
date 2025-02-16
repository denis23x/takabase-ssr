/** @format */

import { Component, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { WindowComponent } from '../window/window.component';
import { fromEvent, Subscription } from 'rxjs';
import { PlatformService } from '../../../core/services/platform.service';
import { SvgLogoComponent } from '../svg-logo/svg-logo.component';
import { DeviceDirective } from '../../directives/app-device.directive';
import { HelperService } from '../../../core/services/helper.service';
import { tap } from 'rxjs/operators';

@Component({
	standalone: true,
	imports: [SvgIconComponent, WindowComponent, SvgLogoComponent, DeviceDirective],
	selector: 'app-pwa, [appPWA]',
	templateUrl: './pwa.component.html'
})
export class PWAComponent implements OnInit, OnDestroy {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly helperService: HelperService = inject(HelperService);

	@ViewChild('pwaDialogElement') pwaDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPWASuccess: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appPWAToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	pwaAvailable: boolean = false;
	pwaDialogToggle: boolean = false;

	pwaInstallPrompt: any = null;
	pwaInstallPrompt$: Subscription | undefined;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			// @ts-ignore
			this.pwaAvailable = typeof window.onbeforeinstallprompt !== 'undefined';

			// @ts-ignore
			this.pwaInstallPrompt = window.pwaInstallPrompt;

			/** Set beforeInstallPrompt listener */

			this.pwaInstallPrompt$?.unsubscribe();
			this.pwaInstallPrompt$ = fromEvent(window, 'beforeinstallprompt')
				.pipe(tap((event: Event) => event.preventDefault()))
				.subscribe({
					next: (event: any) => (this.pwaInstallPrompt = event),
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		[this.pwaInstallPrompt$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onTogglePWADialog(toggle: boolean): void {
		this.pwaDialogToggle = toggle;

		if (toggle) {
			this.pwaDialogElement.nativeElement.showModal();
		} else {
			this.pwaDialogElement.nativeElement.close();
		}

		this.appPWAToggle.emit(toggle);
	}

	onClick(): void {
		if (this.pwaAvailable) {
			this.onInstall();
		} else {
			this.onTogglePWADialog(true);
		}
	}

	onInstall(): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			if (this.pwaInstallPrompt) {
				this.pwaInstallPrompt.prompt().then((event: any) => {
					this.pwaAvailable = event.outcome !== 'accepted';
					this.pwaInstallPrompt = null;
				});
			} else {
				const url: URL = this.helperService.getURL();

				window.location.href = url.href;
			}
		}
	}
}
