/** @format */

import { Directive } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

/** https://netbasal.com/how-to-trim-the-value-of-angulars-form-control-87660941e6cb */

@Directive({
	standalone: true,
	selector: '[appInputTrimWhitespace]'
})
export class AppInputTrimWhitespaceDirective {
	constructor(private ngControl: NgControl) {
		trimValueAccessor(ngControl.valueAccessor);
	}
}

function trimValueAccessor(valueAccessor: ControlValueAccessor) {
	const original = valueAccessor.registerOnChange;

	valueAccessor.registerOnChange = (fn: (_: unknown) => void) => {
		return original.call(valueAccessor, (value: unknown) => {
			return fn(typeof value === 'string' ? value.trim() : value);
		});
	};
}
