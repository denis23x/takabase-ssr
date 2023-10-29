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
		this.trimValue(this.ngControl.valueAccessor);
	}

	trimValue(controlValueAccessor: ControlValueAccessor) {
		const originalControlValueAccessor: any = controlValueAccessor.registerOnChange;

		controlValueAccessor.registerOnChange = (fn: (_: unknown) => void) => {
			return originalControlValueAccessor.call(controlValueAccessor, (value: unknown) => {
				return fn(typeof value === 'string' ? value.trim() : value);
			});
		};
	}
}
