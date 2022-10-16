/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, LoginDto, HelperService, User } from '../../core';
import { filter } from 'rxjs/operators';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html'
})
export class AuthLoginComponent implements OnInit, OnDestroy {
  queryParams$: Subscription;

  loginForm: UntypedFormGroup;
  loginFormIsSubmitted: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private formBuilder: UntypedFormBuilder,
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
        filter((params: Params) => {
          const email = params.email;
          const social = ['facebookId', 'githubId', 'googleId']
            .filter((social: string) => params[social])
            .map((social: string) => ({ [social]: params[social] }))
            .shift();

          return !!email && !!social;
        })
      )
      .subscribe((params: Params) => this.onLogin(params));
  }

  ngOnDestroy(): void {
    [this.queryParams$].forEach($ => $?.unsubscribe());
  }

  onLogin(value: any): void {
    this.loginFormIsSubmitted = true;

    const loginDto: LoginDto = {
      ...value
    };

    // prettier-ignore
    this.authService.onLogin(loginDto).subscribe(
      (user: User) => this.router.navigate(['/@' + user.name]).then(() => console.debug('Route changed')),
      () => (this.loginFormIsSubmitted = false)
    );
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.loginForm)) {
      this.onLogin(this.loginForm.value);
    }
  }
}
