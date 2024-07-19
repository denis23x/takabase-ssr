/** @format */

import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WindowComponent } from '../window/window.component';
import { PlatformService } from '../../../core/services/platform.service';
import { BusService } from '../../../core/services/bus.service';
import hotkeys from 'hotkeys-js';
import type { MarkdownShortcut } from '../../../core/models/markdown.model';

@Component({
	standalone: true,
	imports: [WindowComponent],
	selector: 'app-shortcuts, [appShortcuts]',
	templateUrl: './shortcuts.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShortcutsComponent implements OnInit, OnDestroy {
	private readonly busService: BusService = inject(BusService);
	private readonly platformService: PlatformService = inject(PlatformService);

	@ViewChild('shortcutsDialog') shortcutsDialog: ElementRef<HTMLDialogElement> | undefined;

	shortcutsList: MarkdownShortcut[] = [
		{
			key: 'formatting-bold',
			label: 'Bold',
			shortcut: ['modifier', 'b']
		},
		{
			key: 'formatting-italic',
			label: 'Italic',
			shortcut: ['modifier', 'i']
		},
		{
			key: 'formatting-strikethrough',
			label: 'Strikethrough',
			shortcut: ['modifier', 'd']
		},
		{
			key: 'formatting-underline',
			label: 'Underline',
			shortcut: ['modifier', 'u']
		},
		{
			key: 'url-link',
			label: 'Hyperlink dialog',
			shortcut: ['shift', 'ctrl', '1']
		},
		{
			key: 'url-youtube',
			label: 'Youtube dialog',
			shortcut: ['shift', 'ctrl', '2']
		},
		{
			key: 'cropper',
			label: 'Cropper dialog',
			shortcut: ['shift', 'ctrl', '3']
		},
		{
			key: 'quote',
			label: 'Quote',
			shortcut: ['shift', 'ctrl', '4']
		},
		{
			key: 'spoiler',
			label: 'Spoiler',
			shortcut: ['shift', 'ctrl', '5']
		},
		{
			key: 'code',
			label: 'Code',
			shortcut: ['shift', 'ctrl', '6']
		}
	];

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const osModifierKey: string = this.platformService.getOSModifierKey();

			/** Prepare osModifierKey */

			this.shortcutsList = this.shortcutsList.map((markdownShortcut: MarkdownShortcut) => {
				markdownShortcut.shortcut = markdownShortcut.shortcut.map((shortcut: string) => {
					if (shortcut === 'modifier') {
						return this.platformService.getOSKeyboardCharacter(osModifierKey);
					}

					return this.platformService.getOSKeyboardCharacter(shortcut);
				});

				return markdownShortcut;
			});

			/** Bind shortcuts */

			hotkeys(osModifierKey + '+/', () => this.onToggleShortcutsDialog(true));

			this.shortcutsList.forEach((markdownShortcut: MarkdownShortcut) => {
				hotkeys(markdownShortcut.shortcut.join('+'), 'markdown', (keyboardEvent: KeyboardEvent) => {
					keyboardEvent.stopPropagation();
					keyboardEvent.preventDefault();

					/** Emit to markdown-it */

					this.busService.markdownItTriggerShortcut.next(markdownShortcut);
				});
			});

			hotkeys.filter = (keyboardEvent: KeyboardEvent): boolean => {
				const target: EventTarget = keyboardEvent.target || keyboardEvent.srcElement;

				// @ts-ignore
				if (target.tagName === 'TEXTAREA') {
					hotkeys.setScope('markdown');
				} else {
					hotkeys.setScope('all');
				}

				return true;
			};
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
