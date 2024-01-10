/** @format */

import { Directive, inject } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

/** https://netbasal.com/how-to-trim-the-value-of-angulars-form-control-87660941e6cb */

@Directive({
	standalone: true,
	selector: '[appInputTrimWhitespace]'
})
export class InputTrimWhitespaceDirective {
	private readonly ngControl: NgControl = inject(NgControl);

	constructor() {
		this.trimWhitespace(this.ngControl.valueAccessor);
	}

	trimWhitespace(controlValueAccessor: ControlValueAccessor) {
		const originalControlValueAccessor: any = controlValueAccessor.registerOnChange;

		controlValueAccessor.registerOnChange = (fn: (_: unknown) => void) => {
			return originalControlValueAccessor.call(controlValueAccessor, (value: unknown) => {
				return fn(typeof value === 'string' ? value.trim() : value);
			});
		};
	}
}
