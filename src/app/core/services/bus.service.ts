/** @format */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MarkdownShortcut } from '../models/markdown.model';

@Injectable({
	providedIn: 'root'
})
export class BusService {
	markdownItTriggerClipboard: Subject<ClipboardEventInit> = new Subject<ClipboardEventInit>();
	markdownItTriggerShortcut: Subject<MarkdownShortcut | null> = new Subject<MarkdownShortcut | null>();

	markdownItCropperImage: Subject<File> = new Subject<File>();
	markdownItCropperToggle: Subject<boolean> = new Subject<boolean>();
}
