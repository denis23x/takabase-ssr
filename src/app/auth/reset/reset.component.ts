/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HelperService } from '../../core';

@Component({
  selector: 'app-auth-reset',
  templateUrl: './reset.component.html'
})
export class AuthResetComponent implements OnInit, OnDestroy {
  resetForm: FormGroup;
  resetForm$: Subscription;
  resetFormIsSubmitted: boolean;

  constructor(private formBuilder: FormBuilder, private helperService: HelperService) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.resetForm)) {
      this.resetFormIsSubmitted = true;
    }
  }
}
