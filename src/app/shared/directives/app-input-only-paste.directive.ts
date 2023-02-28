/** @format */

import { Directive, HostListener, OnInit } from '@angular/core';

@Directive({
	standalone: true,
	selector: '[appInputOnlyPaste]'
})
export class AppInputOnlyPasteDirective implements OnInit {
	@HostListener('keydown', ['$event']) onKeydown(keyboardEvent: KeyboardEvent) {
		const ctrlKey: boolean = keyboardEvent.ctrlKey;

		const c: boolean = keyboardEvent.key.toLowerCase() === 'c';
		const v: boolean = keyboardEvent.key.toLowerCase() === 'v';

		const backspace: boolean = keyboardEvent.key.toLowerCase() === 'backspace';

		if (!(ctrlKey && (c || v)) && !backspace) {
			keyboardEvent.stopImmediatePropagation();
			keyboardEvent.stopPropagation();
			keyboardEvent.preventDefault();
		}
	}

	constructor() {}

	ngOnInit(): void {}
}
