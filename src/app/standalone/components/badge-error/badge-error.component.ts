/** @format */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
	standalone: true,
	selector: 'app-badge-error, [appBadgeError]',
	imports: [CommonModule],
	templateUrl: './badge-error.component.html'
})
export class BadgeErrorComponent {
	@Input({ required: true })
	set appBadgeErrorAbstractControl(abstractControl: AbstractControl) {
		this.abstractControl = abstractControl;
	}

	abstractControl: AbstractControl | undefined;
}
