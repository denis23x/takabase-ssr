/** @format */

import { AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { WindowComponent } from '../window/window.component';
import { PlatformService } from '../../../core/services/platform.service';
import { HelperService } from '../../../core/services/helper.service';
import { KbdCommandDirective } from '../../directives/app-kbd-command.directive';
import hotkeys, { HotkeysEvent } from 'hotkeys-js';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [WindowComponent, KbdCommandDirective, SvgIconComponent],
	selector: 'app-shortcuts, [appShortcuts]',
	templateUrl: './shortcuts.component.html'
})
export class ShortcutsComponent implements AfterViewInit, OnDestroy {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly helperService: HelperService = inject(HelperService);

	@ViewChild('shortcutsDialog') shortcutsDialog: ElementRef<HTMLDialogElement> | undefined;

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			const command: string = this.helperService.getOSCommandKey();

			hotkeys.filter = (keyboardEvent: KeyboardEvent): boolean => true;

			hotkeys(command + '+/', (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
				this.onToggleShortcutsDialog(true);
			});

			hotkeys(command + '+b', (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
				alert('ctrl+b');
			});
		}
	}

	ngOnDestroy(): void {
		if (this.platformService.isBrowser()) {
			hotkeys.unbind();
		}
	}

	onToggleShortcutsDialog(toggle: boolean): void {
		if (toggle) {
			this.shortcutsDialog.nativeElement.showModal();
		} else {
			this.shortcutsDialog.nativeElement.close();
		}
	}
}
