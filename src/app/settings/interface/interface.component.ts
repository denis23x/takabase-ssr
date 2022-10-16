/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';
import { AuthService, User, UserService, UserUpdateDto } from '../../core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings-interface',
  templateUrl: './interface.component.html'
})
export class SettingsInterfaceComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

  user: User;

  themeForm: UntypedFormGroup;
  themeForm$: Subscription;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    this.themeForm = this.formBuilder.group({
      theme: ['AUTO', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.parent?.data
      .pipe(
        pluck('data'),
        tap((user: User) => (this.user = user))
      )
      .subscribe((user: User) => this.themeForm.patchValue(user.settings));

    this.themeForm$ = this.themeForm.valueChanges.subscribe((value: any) => {
      const userUpdateDto: UserUpdateDto = {
        settings: value
      };

      this.userService
        .update(this.user.id, userUpdateDto)
        .subscribe((user: User) => this.authService.setAuthorization(user));
    });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.themeForm$].forEach($ => $?.unsubscribe());
  }
}
