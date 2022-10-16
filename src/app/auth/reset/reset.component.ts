/** @format */

import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HelperService } from '../../core';

@Component({
  selector: 'app-auth-reset',
  templateUrl: './reset.component.html'
})
export class AuthResetComponent implements OnInit {
  resetForm: UntypedFormGroup;
  resetForm$: Subscription;
  resetFormIsSubmitted: boolean;

  constructor(private formBuilder: UntypedFormBuilder, private helperService: HelperService) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.resetForm)) {
      this.resetFormIsSubmitted = true;
    }
  }
}
