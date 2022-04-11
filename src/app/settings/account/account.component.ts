/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, User, UserService, HelperService, SnackbarService } from '../../core';
import { pluck } from 'rxjs/operators';
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
    [this.accountForm$].forEach($ => $?.unsubscribe());
  }

  onSubmitForm(): void {
    // if (this.helperService.getFormValidation(this.accountForm)) {
    //   this.userService.update(this.accountForm.value).subscribe((user: User) => {
    //     this.authService.userSubject.next(user);
    //     this.snackbarService.info('Information updated');
    //   });
    // }
  }

  onDeleteUser(): void {
    console.log('onDeleteUser');
  }
}
