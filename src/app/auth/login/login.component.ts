/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthLoginDto, HelperService } from '../../core';
import { filter } from 'rxjs/operators';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html'
})
export class AuthLoginComponent implements OnInit, OnDestroy {
  queryParams$: Subscription;

  loginForm: FormGroup;
  loginFormIsSubmitted: boolean;

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
      // prettier-ignore
      password: ['', [Validators.required, Validators.pattern(this.helperService.getRegex('password'))]]
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
            .filter((social: string) => queryParams[social])
            .map((social: string) => ({ [social]: queryParams[social] }))
            .shift();

          return !!email && !!social;
        })
      )
      .subscribe((authLoginDto: any) => this.onLogin(authLoginDto));
  }

  ngOnDestroy(): void {
    [this.queryParams$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onLogin(authLoginDto: AuthLoginDto): void {
    this.loginFormIsSubmitted = true;

    this.authService.onLogin(authLoginDto).subscribe(
      () => this.router.navigate(['/']).then(() => console.debug('Route changed')),
      () => (this.loginFormIsSubmitted = false)
    );
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.loginForm)) {
      this.onLogin(this.loginForm.value);
    }
  }
}
