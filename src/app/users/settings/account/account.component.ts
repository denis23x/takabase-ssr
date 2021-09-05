/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HelperService, User } from '../../../core';
import { pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users-settings-account',
  templateUrl: './account.component.html'
})
export class UsersSettingsAccountComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  user: User;

  accountForm: FormGroup;
  accountForm$: Subscription;

  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private route: ActivatedRoute
  ) {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required]],
      biography: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // @ts-ignore
    this.routeData$ = this.route.parent?.data.pipe(pluck('data')).subscribe((user: User) => {
      this.user = user;

      this.accountForm.patchValue(this.user);
    });

    this.accountForm$ = this.accountForm.valueChanges.subscribe(value => {
      console.log(value);
    });
  }

  ngOnDestroy(): void {
    this.accountForm$?.unsubscribe();
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.accountForm)) {
      console.log('All good!', this.accountForm.value);
    }
  }
}
