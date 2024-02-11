/** @format */

import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WindowComponent } from '../window/window.component';
import { PlatformService } from '../../../core/services/platform.service';
import { MarkdownShortcut } from '../../../core/models/markdown.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import hotkeys from 'hotkeys-js';

@Component({
	standalone: true,
	imports: [WindowComponent],
	selector: 'app-shortcuts, [appShortcuts]',
	templateUrl: './shortcuts.component.html'
})
export class ShortcutsComponent implements OnInit, OnDestroy {
	private readonly markdownService: MarkdownService = inject(MarkdownService);
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
			key: 'formatting-mark',
			label: 'Mark',
			shortcut: ['modifier', 'u']
		},
		{
			key: 'hr',
			label: 'Horizontal line',
			shortcut: ['modifier', 'f']
		},
		{
			key: 'heading-h1',
			label: 'Heading 1',
			shortcut: ['alt', 'shift', '1']
		},
		{
			key: 'heading-h2',
			label: 'Heading 2',
			shortcut: ['alt', 'shift', '2']
		},
		{
			key: 'heading-h3',
			label: 'Heading 3',
			shortcut: ['alt', 'shift', '3']
		},
		{
			key: 'heading-h4',
			label: 'Heading 4',
			shortcut: ['alt', 'shift', '4']
		},
		{
			key: 'url-link',
			label: 'Hyperlink dialog',
			shortcut: ['modifier', 'shift', '1']
		},
		{
			key: 'url-image',
			label: 'Image dialog',
			shortcut: ['modifier', 'shift', '2']
		},
		{
			key: 'url-youtube',
			label: 'Youtube dialog',
			shortcut: ['modifier', 'shift', '3']
		},
		{
			key: 'cropper',
			label: 'Cropper dialog',
			shortcut: ['modifier', 'shift', '4']
		},
		{
			key: 'quote',
			label: 'Quote',
			shortcut: ['modifier', 'shift', '5']
		},
		{
			key: 'spoiler',
			label: 'Spoiler',
			shortcut: ['modifier', 'shift', '6']
		},
		{
			key: 'list-unordered',
			label: 'Ordered list',
			shortcut: ['modifier', 'shift', '7']
		},
		{
			key: 'list-ordered',
			label: 'Unordered list',
			shortcut: ['modifier', 'shift', '8']
		},
		{
			key: 'list-checkbox',
			label: 'Checkbox list',
			shortcut: ['modifier', 'shift', '9']
		},
		{
			key: 'code',
			label: 'Code',
			shortcut: ['modifier', 'shift', '0']
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

					this.markdownService.markdownItShortcut.next(markdownShortcut);
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
