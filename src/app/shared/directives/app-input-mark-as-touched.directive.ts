/** @format */

import { Directive, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { skip } from 'rxjs/operators';

@Directive({
	standalone: true,
	selector: '[appInputMarkAsTouched]'
})
export class AppInputMarkAsTouchedDirective implements OnInit {
	constructor(private ngControl: NgControl) {}

	ngOnInit(): void {
		this.ngControl.statusChanges
			.pipe(distinctUntilChanged(), skip(1))
			.subscribe({
				next: () => this.ngControl.control.markAsTouched(),
				error: (error: any) => console.error(error)
			});
	}
}
