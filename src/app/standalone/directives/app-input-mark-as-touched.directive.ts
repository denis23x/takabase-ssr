/** @format */

import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControlStatus, NgControl, ValidationErrors } from '@angular/forms';
import { filter, startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Directive({
	standalone: true,
	selector: '[appInputMarkAsTouched]'
})
export class AppInputMarkAsTouchedDirective implements OnInit, OnDestroy {
	formControlStatus: FormControlStatus;
	formControlStatus$: Subscription;

	validationErrors: string | undefined;

	isAppInputOnlyPaste: boolean = false;

	constructor(private elementRef: ElementRef, private ngControl: NgControl) {}

	ngOnInit(): void {
		// prettier-ignore
		this.isAppInputOnlyPaste = this.elementRef.nativeElement.getAttribute('appInputOnlyPaste'.toLowerCase()) !== null;

		this.formControlStatus$ = this.ngControl.control.statusChanges
			.pipe(
				startWith(this.ngControl.control.status),
				filter((formControlStatus: FormControlStatus) => {
					if (this.isAppInputOnlyPaste) {
						// prettier-ignore
						return this.getStatusSolution(formControlStatus) || this.getErrorsSolution(this.ngControl.control.errors);
					}

					return this.getStatusSolution(formControlStatus);
				})
			)
			.subscribe({
				next: () => this.ngControl.control.markAsTouched(),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.formControlStatus$].forEach($ => $?.unsubscribe());
	}

	getStatusSolution(formControlStatus: FormControlStatus): boolean {
		switch (true) {
			case !this.formControlStatus: {
				this.formControlStatus = formControlStatus;

				return false;
			}
			case this.formControlStatus !== formControlStatus: {
				this.formControlStatus = formControlStatus;

				return true;
			}
			default: {
				return false;
			}
		}
	}

	getErrorsSolution(validationErrors: ValidationErrors): boolean {
		const validationErrorsString: string = JSON.stringify(validationErrors);

		switch (true) {
			case !this.validationErrors: {
				this.validationErrors = validationErrorsString;

				return false;
			}
			case this.validationErrors !== validationErrorsString: {
				this.validationErrors = validationErrorsString;

				return true;
			}
			default: {
				return false;
			}
		}
	}
}
