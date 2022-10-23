/** @format */

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HelperService } from '../../core';

interface ResetForm {
  email: FormControl<string>;
}

@Component({
  selector: 'app-auth-reset',
  templateUrl: './reset.component.html'
})
export class AuthResetComponent implements OnInit {
  resetForm: FormGroup | undefined;
  resetFormIsSubmitted: boolean = false;

  constructor(private formBuilder: FormBuilder, private helperService: HelperService) {
    this.resetForm = this.formBuilder.group<ResetForm>({
      email: this.formBuilder.control('', [Validators.required, Validators.email])
    });
  }

  ngOnInit(): void {}

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.resetForm)) {
      this.resetFormIsSubmitted = true;
    }
  }
}
