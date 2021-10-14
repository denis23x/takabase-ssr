/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HelperService } from '../../core';
import { AuthService, AuthLoginDto } from '../core';
import { fade } from '../../app.animation';
import { filter } from 'rxjs/operators';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html',
  animations: [fade]
})
export class AuthLoginComponent implements OnInit, OnDestroy {
  queryParams$: Subscription;

  loginForm: FormGroup;
  loginForm$: Subscription;
  loginFormSubmitted: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private meta: Meta,
    private title: Title
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]]
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Draftnow - Login');

    this.meta.addTag({ name: 'title', content: 'my login title' });
    this.meta.addTag({ name: 'description', content: 'my login description' });

    this.queryParams$ = this.activatedRoute.queryParams
      .pipe(
        filter((queryParams: Params) => {
          const email = queryParams.email;
          const social = ['googleId', 'facebookId']
            .filter(i => queryParams[i])
            .map(n => ({ [n]: queryParams[n] }))
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
    this.loginFormSubmitted = true;

    this.loginForm$ = this.authService.getAuthentication('/auth/login', authLoginDto).subscribe(
      () => this.router.navigateByUrl('/'),
      () => (this.loginFormSubmitted = false)
    );
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.loginForm)) {
      this.getAuthentication();
    }
  }
}
