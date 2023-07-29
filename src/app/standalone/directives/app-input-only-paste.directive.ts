/** @format */

import { Directive, HostListener } from '@angular/core';

@Directive({
	standalone: true,
	selector: '[appInputOnlyPaste]'
})
export class AppInputOnlyPasteDirective {
	@HostListener('keydown', ['$event']) onKeydown(keyboardEvent: KeyboardEvent) {
		const ctrlKey: boolean = keyboardEvent.ctrlKey;
		const metaKey: boolean = keyboardEvent.metaKey;

		const c: boolean = keyboardEvent.key.toLowerCase() === 'c';
		const v: boolean = keyboardEvent.key.toLowerCase() === 'v';

		const backspace: boolean = keyboardEvent.key.toLowerCase() === 'backspace';

		if (!((ctrlKey || metaKey) && (c || v)) && !backspace) {
			keyboardEvent.stopImmediatePropagation();
			keyboardEvent.stopPropagation();
			keyboardEvent.preventDefault();
		}
	}
}
