/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HelperService, UserService, AuthLoginDto } from '../../core';
import { fade } from '../../app.animation';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html',
  animations: [fade]
})
export class AuthLoginComponent implements OnInit, OnDestroy {
  queryParams$: Subscription;

  loginForm: FormGroup;
  loginForm$: Subscription;

  isSubmitting = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private helperService: HelperService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]]
    });
  }

  ngOnInit(): void {
    this.queryParams$ = this.activatedRoute.queryParams
      .pipe(
        filter(params => {
          const email = params.email;
          const social = ['googleId', 'facebookId']
            .filter(i => params[i])
            .map(n => ({ [n]: params[n] }))
            .shift();

          return !!email && !!social;
        })
      )
      // @ts-ignore
      .subscribe((authLoginDto: AuthLoginDto) => this.getAuthentication(authLoginDto));
  }

  ngOnDestroy(): void {
    [this.queryParams$, this.loginForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getAuthentication(authLoginDto: AuthLoginDto = this.loginForm.value): void {
    this.isSubmitting = true;

    this.loginForm$ = this.userService.getAuthentication('/auth/login', authLoginDto).subscribe(
      () => this.router.navigateByUrl('/'),
      () => (this.isSubmitting = false)
    );
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.loginForm)) {
      this.getAuthentication();
    }
  }
}
