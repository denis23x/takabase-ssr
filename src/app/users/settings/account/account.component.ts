/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HelperService } from '../../../core';

@Component({
  selector: 'app-users-settings-account',
  templateUrl: './account.component.html'
})
export class UsersSettingsAccountComponent implements OnInit, OnDestroy {
  queryParams$: Subscription;

  accountForm: FormGroup;
  accountForm$: Subscription;

  isSubmitting = false;

  constructor(private fb: FormBuilder, private helperService: HelperService) {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required]],
      biography: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.accountForm$ = this.accountForm.valueChanges.subscribe(value => {
      console.log(value);
    });
  }

  ngOnDestroy() {
    this.accountForm$?.unsubscribe();
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.accountForm)) {
      console.log('all good!');
    }
  }
}
