/** @format */

import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthRegistrationDto, HelperService } from '../../core';
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

  onRegistration(authRegistrationDto: AuthRegistrationDto): void {
    this.registrationFormIsSubmitted = true;

    this.authService
      .onRegistration(authRegistrationDto)
      .pipe(switchMap(() => this.authService.onLogin(authRegistrationDto)))
      .subscribe(
        () => this.router.navigate(['/']).then(() => console.debug('Route changed')),
        () => (this.registrationFormIsSubmitted = false)
      );
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.registrationForm)) {
      this.onRegistration(this.registrationForm.value);
    }
  }
}
