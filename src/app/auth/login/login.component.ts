/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, LoginDto, HelperService, User } from '../../core';
import { filter } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html'
})
export class AuthLoginComponent implements OnInit, OnDestroy {
  queryParams$: Subscription;

  loginForm: FormGroup;
  loginFormIsSubmitted: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private meta: Meta
  ) {
    this.loginForm = this.formBuilder.group<LoginForm>({
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.control('', [
        Validators.required,
        Validators.pattern(this.helperService.getRegex('password'))
      ])
    });
  }

  ngOnInit(): void {
    this.meta.addTag({ name: 'title', content: 'my login title' });
    this.meta.addTag({ name: 'description', content: 'my login description' });

    this.queryParams$ = this.activatedRoute.queryParams
      .pipe(
        filter((params: Params) => {
          const email: string | undefined = params.email;
          const social: any = ['facebookId', 'githubId', 'googleId']
            .filter((social: string) => params[social])
            .map((social: string) => ({ [social]: params[social] }))
            .shift();

          return !!email && !!social;
        })
      )
      .subscribe({
        next: (params: Params) => this.onLogin(params),
        error: (error: any) => console.error(error),
        complete: () => console.debug('Query params subscription complete')
      });
  }

  ngOnDestroy(): void {
    [this.queryParams$].forEach($ => $?.unsubscribe());
  }

  onLogin(value: any): void {
    this.loginFormIsSubmitted = true;

    const loginDto: LoginDto = {
      ...value
    };

    this.authService.onLogin(loginDto).subscribe({
      // prettier-ignore
      next: (user: User) => this.router.navigate(['/@' + user.name]).then(() => console.debug('Route changed')),
      error: () => (this.loginFormIsSubmitted = false),
      complete: () => console.debug('User login subscription complete')
    });
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.loginForm)) {
      this.onLogin(this.loginForm.value);
    }
  }
}
