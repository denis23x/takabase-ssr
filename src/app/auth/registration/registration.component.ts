/** @format */

import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthRegistrationDto, HelperService } from '../../core';

@Component({
  selector: 'app-auth-registration',
  templateUrl: './registration.component.html'
})
export class AuthRegistrationComponent implements OnDestroy {
  registrationForm: FormGroup;
  registrationForm$: Subscription;
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
      password: [
        '',
        [Validators.required, Validators.pattern(this.helperService.getRegex('password'))]
      ]
    });
  }

  ngOnDestroy(): void {
    [this.registrationForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getAuthentication(): void {
    this.registrationFormIsSubmitted = true;

    const authRegistrationDto: AuthRegistrationDto = {
      ...this.registrationForm.value
    };

    this.registrationForm$ = this.authService
      .getAuthentication('/users', authRegistrationDto)
      .subscribe(
        () => this.router.navigateByUrl('/'),
        () => (this.registrationFormIsSubmitted = false)
      );
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.registrationForm)) {
      this.getAuthentication();
    }
  }
}
