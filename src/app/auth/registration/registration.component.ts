/** @format */

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthService,
  RegistrationDto,
  LoginDto,
  HelperService,
  User,
  UserService
} from '../../core';
import { switchMap } from 'rxjs/operators';

interface RegistrationForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-auth-registration',
  templateUrl: './registration.component.html'
})
export class AuthRegistrationComponent implements OnInit {
  registrationForm: FormGroup | undefined;
  registrationFormIsSubmitted: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private helperService: HelperService
  ) {
    this.registrationForm = this.formBuilder.group<RegistrationForm>({
      name: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(24)
      ]),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.control('', [
        Validators.required,
        Validators.pattern(this.helperService.getRegex('password'))
      ])
    });
  }

  ngOnInit(): void {}

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.registrationForm)) {
      this.registrationFormIsSubmitted = true;

      const registrationDto: RegistrationDto = {
        ...this.registrationForm.value
      };

      this.userService
        .create(registrationDto)
        .pipe(
          switchMap((user: User) => {
            const loginDto: LoginDto = {
              email: registrationDto.email,
              password: registrationDto.password
            };

            return this.authService.onLogin(loginDto);
          })
        )
        .subscribe({
          // prettier-ignore
          next: (user: User) => this.router.navigate(['/@' + user.name]).then(() => console.debug('Route changed')),
          error: () => (this.registrationFormIsSubmitted = false)
        });
    }
  }
}
