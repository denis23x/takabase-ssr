/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  AuthService,
  User,
  UserService,
  HelperService,
  SnackbarService,
  UserUpdateDto
} from '../../core';
import { pluck, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings-account',
  templateUrl: './account.component.html'
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

  user: User;

  accountForm: FormGroup;
  accountForm$: Subscription;
  accountFormIsSubmitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {
    this.accountForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      biography: ['']
    });
  }

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.parent.data
      .pipe(
        pluck('data'),
        tap((user: User) => (this.user = user))
      )
      .subscribe((user: User) => this.accountForm.patchValue(user));
  }

  ngOnDestroy(): void {
    [this.accountForm$].forEach($ => $?.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.accountForm)) {
      this.accountFormIsSubmitted = true;

      const userUpdateDto: UserUpdateDto = {
        ...this.accountForm.value
      };

      this.userService.update(this.user.id, userUpdateDto).subscribe(
        (user: User) => {
          this.authService.setAuthorization(user);

          this.snackbarService.success('Information updated');

          this.accountFormIsSubmitted = false;
        },
        () => (this.accountFormIsSubmitted = false)
      );
    }
  }

  onDeleteUser(): void {
    console.log('onDeleteUser');
  }
}
