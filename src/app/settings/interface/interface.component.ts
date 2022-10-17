/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';
import { AuthService, User, UserService, UserUpdateDto } from '../../core';
import { ActivatedRoute } from '@angular/router';

interface ThemeForm {
  theme: FormControl<string>;
}

@Component({
  selector: 'app-settings-interface',
  templateUrl: './interface.component.html'
})
export class SettingsInterfaceComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

  user: User;

  themeForm: FormGroup;
  themeForm$: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    this.themeForm = this.formBuilder.group<ThemeForm>({
      theme: this.formBuilder.control('AUTO', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.parent?.data
      .pipe(
        pluck('data'),
        tap((user: User) => (this.user = user))
      )
      .subscribe({
        next: (user: User) => this.themeForm.patchValue(user.settings),
        error: (error: any) => console.error(error),
        complete: () => console.debug('Activated route parent data subscription complete')
      });

    this.themeForm$ = this.themeForm.valueChanges.subscribe({
      next: (value: any) => {
        const userUpdateDto: UserUpdateDto = {
          settings: value
        };

        this.userService.update(this.user.id, userUpdateDto).subscribe({
          next: (user: User) => this.authService.setAuthorization(user),
          error: (error: any) => console.error(error),
          complete: () => console.debug('User service update subscription complete')
        });
      },
      error: (error: any) => console.error(error),
      complete: () => console.debug('Theme form values changes subscription complete')
    });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.themeForm$].forEach($ => $?.unsubscribe());
  }
}
