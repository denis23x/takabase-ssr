/** @format */

import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HelperService, RegistrationDto, UserService } from '../../core';
import { fade } from '../../app.animation';

@Component({
  selector: 'app-auth-registration',
  templateUrl: './registration.component.html',
  animations: [fade]
})
export class AuthRegistrationComponent implements OnDestroy {
  registrationForm: FormGroup;
  registrationForm$: Subscription;

  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private helperService: HelperService
  ) {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(this.helperService.getRegex('password'))]
      ]
    });
  }

  ngOnDestroy(): void {
    this.registrationForm$?.unsubscribe();
  }

  getAuthentication(registrationDto: RegistrationDto = this.registrationForm.value): void {
    this.isSubmitting = true;

    this.registrationForm$ = this.userService
      .getAuthentication('/users', registrationDto)
      .subscribe(
        () => this.router.navigateByUrl('/'),
        () => (this.isSubmitting = false)
      );
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.registrationForm)) {
      this.getAuthentication();
    }
  }
}
