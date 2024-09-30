/** @format */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import type { MarkdownShortcut } from '../models/markdown.model';
import type MarkdownIt from 'markdown-it';

@Injectable({
	providedIn: 'root'
})
export class BusService {
	markdownItServer: MarkdownIt | undefined;
	markdownItBrowser: MarkdownIt | undefined;

	markdownItTriggerClipboard: Subject<ClipboardEventInit> = new Subject<ClipboardEventInit>();
	markdownItTriggerShortcut: Subject<MarkdownShortcut | null> = new Subject<MarkdownShortcut | null>();

	markdownItCropperImage: Subject<File> = new Subject<File>();
	markdownItCropperToggle: Subject<boolean> = new Subject<boolean>();
}
