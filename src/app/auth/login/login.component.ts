/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HelperService, UserService, LoginDto } from '../../core';
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
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private helperService: HelperService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]]
    });
  }

  ngOnInit(): void {
    this.queryParams$ = this.route.queryParams
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
      .subscribe((loginDto: LoginDto) => this.getAuthentication(loginDto));
  }

  ngOnDestroy(): void {
    [this.queryParams$, this.loginForm$].forEach($ => $?.unsubscribe());
  }

  getAuthentication(loginDto: LoginDto = this.loginForm.value): void {
    this.isSubmitting = true;

    this.loginForm$ = this.userService.getAuthentication('/auth/login', loginDto).subscribe(
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
