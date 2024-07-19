/** @format */

import { Component, Input } from '@angular/core';
import type { AbstractControl } from '@angular/forms';

@Component({
	standalone: true,
	selector: 'app-badge-error, [appBadgeError]',
	templateUrl: './badge-error.component.html'
})
export class BadgeErrorComponent {
	@Input({ required: true })
	set appBadgeErrorAbstractControl(abstractControl: AbstractControl) {
		this.abstractControl = abstractControl;
	}

	abstractControl: AbstractControl | undefined;
}
