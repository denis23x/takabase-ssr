/** @format */

import { Directive, HostListener, OnInit } from '@angular/core';

@Directive({
	selector: '[appInputOnlyPaste]'
})
export class AppInputOnlyPasteDirective implements OnInit {
	@HostListener('keydown', ['$event']) onKeydown(keyboardEvent: KeyboardEvent) {
		const ctrl: boolean = keyboardEvent.ctrlKey;

		const c: boolean = keyboardEvent.key.toLowerCase() === 'c';
		const v: boolean = keyboardEvent.key.toLowerCase() === 'v';

		if (!ctrl || (!c && !v)) {
			keyboardEvent.stopImmediatePropagation();
			keyboardEvent.stopPropagation();
			keyboardEvent.preventDefault();
		}
	}

	constructor() {}

	ngOnInit(): void {}
}
