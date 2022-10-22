/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { AuthService, User, UserService, UserUpdateDto } from '../../core';
import { ActivatedRoute, Data } from '@angular/router';

interface ThemeForm {
  theme: FormControl<string>;
}

@Component({
  selector: 'app-settings-interface',
  templateUrl: './interface.component.html'
})
export class SettingsInterfaceComponent implements OnInit, OnDestroy {
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
    this.activatedRoute.parent?.data
      .pipe(
        first(),
        map((data: Data) => data.data),
        tap((user: User) => (this.user = user))
      )
      .subscribe({
        next: (user: User) => this.themeForm.patchValue(user.settings),
        error: (error: any) => console.error(error)
      });

    this.themeForm$ = this.themeForm.valueChanges.subscribe({
      next: (value: any) => {
        const userUpdateDto: UserUpdateDto = {
          settings: value
        };

        this.userService.update(this.user.id, userUpdateDto).subscribe({
          next: (user: User) => this.authService.setAuthorization(user),
          error: (error: any) => console.error(error)
        });
      },
      error: (error: any) => console.error(error)
    });
  }

  ngOnDestroy(): void {
    [this.themeForm$].forEach($ => $?.unsubscribe());
  }
}
