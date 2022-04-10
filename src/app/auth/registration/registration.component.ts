/** @format */

import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegistrationDto, LoginDto, HelperService, User } from '../../core';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-auth-registration',
  templateUrl: './registration.component.html'
})
export class AuthRegistrationComponent implements OnDestroy {
  registrationForm: FormGroup;
  registrationFormIsSubmitted: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private helperService: HelperService
  ) {
    this.registrationForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      email: ['', [Validators.required, Validators.email]],
      // prettier-ignore
      password: ['', [Validators.required, Validators.pattern(this.helperService.getRegex('password'))]]
    });
  }

  ngOnDestroy(): void {}

  onRegistration(registrationDto: RegistrationDto): void {
    this.registrationFormIsSubmitted = true;

    // prettier-ignore
    this.authService
      .onRegistration(registrationDto)
      .pipe(
        switchMap(() => {
          const loginDto: LoginDto = {
            email: registrationDto.email,
            password: registrationDto.password
          };

          return this.authService.onLogin(loginDto);
        })
      )
      .subscribe(
        (user: User) => this.router.navigate(['/@' + user.name]).then(() => console.debug('Route changed')),
        () => (this.registrationFormIsSubmitted = false)
      );
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.registrationForm)) {
      this.onRegistration(this.registrationForm.value);
    }
  }
}
