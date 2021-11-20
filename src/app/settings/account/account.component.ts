/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User, UserService, HelperService, SnackbarService } from '../../core';
import { pluck } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/core';

@Component({
  selector: 'app-settings-account',
  templateUrl: './account.component.html'
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

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
    private snackbarService: SnackbarService,
    private router: Router
  ) {
    this.accountForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      biography: ['']
    });
  }

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.parent.data
      .pipe(pluck('data'))
      .subscribe((user: User) => {
        this.user = user;

        this.accountForm.patchValue(this.user);
      });

    this.accountForm$ = this.accountForm.valueChanges.subscribe(value => {
      console.log(value);
    });
  }

  ngOnDestroy(): void {
    [this.accountForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.accountForm)) {
      this.userService.updateProfile(this.accountForm.value).subscribe((user: User) => {
        this.authService.userSubject.next(user);
        this.snackbarService.info('Success', 'Information updated');
      });
    }
  }

  onDeleteUser(): void {
    this.userService.deleteProfile().subscribe(() => {
      this.authService.removeAuthorization();

      this.router
        .navigate(['.'])
        .then(() => this.snackbarService.info('Success', 'Account deleted'));
    });
  }
}
