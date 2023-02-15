/** @format */

import { Component, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';
import { HelperService } from '../../core/services/helper.service';

interface ResetForm {
	email: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule, SvgIconComponent],
	selector: 'app-auth-reset',
	templateUrl: './reset.component.html'
})
export class AuthResetComponent implements OnInit {
	resetForm: FormGroup | undefined;
	resetFormIsSubmitted: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService
	) {
		this.resetForm = this.formBuilder.group<ResetForm>({
			email: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.email
			])
		});
	}

	ngOnInit(): void {}

	onSubmitResetForm(): void {
		if (this.helperService.getFormValidation(this.resetForm)) {
			this.resetFormIsSubmitted = true;
		}
	}
}
