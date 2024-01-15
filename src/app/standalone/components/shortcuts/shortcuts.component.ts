/** @format */

import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	inject,
	OnDestroy,
	ViewChild
} from '@angular/core';
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
export class ShortcutsComponent implements AfterViewInit, OnDestroy {
	private readonly markdownService: MarkdownService = inject(MarkdownService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	@ViewChild('shortcutsDialog') shortcutsDialog: ElementRef<HTMLDialogElement> | undefined;

	shortcutsList: MarkdownShortcut[] = [
		{
			id: 1,
			label: 'Bold',
			key: 'formatting-bold',
			preventDefault: true,
			shortcut: ['modifier', 'b']
		},
		{
			id: 2,
			label: 'Italic',
			key: 'formatting-italic',
			preventDefault: true,
			shortcut: ['modifier', 'i']
		},
		{
			id: 3,
			key: 'formatting-strikethrough',
			label: 'Strikethrough',
			preventDefault: true,
			shortcut: ['modifier', 's']
		},
		{
			id: 31,
			key: 'formatting-mark',
			label: 'Mark',
			preventDefault: true,
			shortcut: ['modifier', 'm']
		},
		{
			id: 4,
			label: 'Heading 1',
			key: 'heading-h1',
			preventDefault: true,
			shortcut: ['alt', 'shift', '1']
		},
		{
			id: 5,
			label: 'Heading 2',
			key: 'heading-h2',
			preventDefault: true,
			shortcut: ['alt', 'shift', '2']
		},
		{
			id: 6,
			label: 'Heading 3',
			key: 'heading-h3',
			preventDefault: true,
			shortcut: ['alt', 'shift', '3']
		},
		{
			id: 7,
			label: 'Heading 4',
			key: 'heading-h4',
			preventDefault: true,
			shortcut: ['alt', 'shift', '4']
		},
		{
			id: 71,
			label: 'Quote',
			preventDefault: true,
			shortcut: ['modifier', 'shift', '6']
		},
		{
			id: 711,
			label: 'Spoiler',
			preventDefault: true,
			shortcut: ['modifier', 'shift', '5']
		},
		{
			id: 8,
			label: 'Ordered list',
			key: 'list-unordered',
			preventDefault: true,
			shortcut: ['modifier', 'shift', '7']
		},
		{
			id: 9,
			label: 'Unordered list',
			key: 'list-ordered',
			preventDefault: true,
			shortcut: ['modifier', 'shift', '8']
		},
		{
			id: 10,
			label: 'Checkbox list',
			key: 'list-checkbox',
			preventDefault: true,
			shortcut: ['modifier', 'shift', '9']
		},
		{
			id: 11,
			label: 'Hyperlink dialog',
			key: 'url-link',
			preventDefault: true,
			shortcut: ['alt', '1']
		},
		{
			id: 12,
			label: 'Image dialog',
			key: 'url-image',
			preventDefault: true,
			shortcut: ['alt', '2']
		},
		{
			id: 13,
			label: 'Youtube dialog',
			key: 'url-youtube',
			preventDefault: true,
			shortcut: ['alt', '3']
		},
		{
			id: 131,
			label: 'Cropper dialog',
			key: 'cropper',
			preventDefault: true,
			shortcut: ['alt', '4']
		},
		{
			id: 14,
			label: 'Horizontal line',
			key: '',
			preventDefault: true,
			shortcut: ['modifier', 'enter']
		},
		{
			id: 15,
			label: 'Fullscreen',
			preventDefault: true,
			shortcut: ['modifier', 'shift', 'enter']
		}
	];

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			const os: string = this.platformService.getOS();
			const osModifierKey: string = this.platformService.getOSModifierKey();

			/** Prepare shortcuts */

			this.shortcutsList = this.shortcutsList.map((markdownShortcut: MarkdownShortcut) => {
				markdownShortcut.shortcut = markdownShortcut.shortcut.map((shortcut: string) => {
					if (shortcut === 'modifier') {
						return this.platformService.getOSKeyboardCharacter(osModifierKey);
					}

					return this.platformService.getOSKeyboardCharacter(shortcut);
				});

				return markdownShortcut;
			});

			// ExpressionChangedAfterItHasBeenCheckedError (command)

			this.changeDetectorRef.detectChanges();

			/** Init shortcuts */

			hotkeys.filter = (): boolean => true;
			hotkeys(osModifierKey + '+/', () => this.onToggleShortcutsDialog(true));

			/** Bind shortcuts */

			this.shortcutsList.forEach((markdownShortcut: MarkdownShortcut) => {
				hotkeys(markdownShortcut.shortcut.join('+'), 'markdown', (keyboardEvent: KeyboardEvent) => {
					if (markdownShortcut.preventDefault) {
						keyboardEvent.preventDefault();
					}

					this.markdownService.markdownItShortcut.next(markdownShortcut);
				});
			});

			hotkeys.setScope('markdown');
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
