/** @format */

import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WindowComponent } from '../window/window.component';
import { PlatformService } from '../../../core/services/platform.service';
import { MarkdownShortcut } from '../../../core/models/markdown.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import hotkeys from 'hotkeys-js';

@Component({
	standalone: true,
	imports: [WindowComponent],
	providers: [MarkdownService],
	selector: 'app-shortcuts, [appShortcuts]',
	templateUrl: './shortcuts.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
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
			key: 'heading-h1',
			label: 'Heading 1',
			shortcut: ['shift', '1']
		},
		{
			key: 'heading-h2',
			label: 'Heading 2',
			shortcut: ['shift', '2']
		},
		{
			key: 'heading-h3',
			label: 'Heading 3',
			shortcut: ['shift', '3']
		},
		{
			key: 'heading-h4',
			label: 'Heading 4',
			shortcut: ['shift', '4']
		},
		{
			key: 'url-link',
			label: 'Hyperlink dialog',
			shortcut: ['shift', 'alt', '1']
		},
		{
			key: 'url-youtube',
			label: 'Youtube dialog',
			shortcut: ['shift', 'alt', '2']
		},
		{
			key: 'cropper',
			label: 'Cropper dialog',
			shortcut: ['shift', 'alt', '3']
		},
		{
			key: 'quote',
			label: 'Quote',
			shortcut: ['shift', 'alt', '4']
		},
		{
			key: 'spoiler',
			label: 'Spoiler',
			shortcut: ['shift', 'alt', '5']
		},
		{
			key: 'code',
			label: 'Code',
			shortcut: ['shift', 'alt', '6']
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
