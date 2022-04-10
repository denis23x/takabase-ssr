/** @format */

import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { first, pairwise, startWith } from 'rxjs/operators';
import { AuthService, User, UserService, LocalStorageService, PlatformService } from '../../core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings-interface',
  templateUrl: './interface.component.html'
})
export class SettingsInterfaceComponent implements OnInit, OnDestroy {
  user: User;
  user$: Subscription;

  colorThemeForm: FormGroup;
  colorThemeForm$: Subscription;

  additionalSearchForm: FormGroup;
  additionalSearchForm$: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer2: Renderer2,
    private formBuilder: FormBuilder,
    private platformService: PlatformService,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private authService: AuthService
  ) {
    this.colorThemeForm = this.formBuilder.group({
      colorTheme: ['auto', [Validators.required]]
    });

    this.additionalSearchForm = this.formBuilder.group({
      users: [false, [Validators.required]],
      categories: [false, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.user$ = this.authService.userSubject.pipe(first()).subscribe((user: User) => {
      this.user = user;

      if ('interfaceConfig' in this.user) {
        // const interfaceConfig = this.user.interfaceConfig as UserInterface;
        //
        // if ('colorTheme' in interfaceConfig) {
        //   this.colorThemeForm.patchValue(interfaceConfig);
        // }
        //
        // if ('users' in interfaceConfig || 'categories' in interfaceConfig) {
        //   this.additionalSearchForm.patchValue(interfaceConfig);
        // }
      }
    });

    this.colorThemeForm$ = this.colorThemeForm.valueChanges
      .pipe(startWith(this.colorThemeForm.value), pairwise())
      .subscribe(([previousValue, currentValue]) => {
        if (this.platformService.isBrowser()) {
          this.renderer2.removeClass(this.document.body, previousValue.colorTheme);
          this.renderer2.addClass(this.document.body, currentValue.colorTheme);

          this.setConfig(currentValue);
        }
      });

    this.additionalSearchForm$ = this.additionalSearchForm.valueChanges.subscribe(value =>
      this.setConfig(value)
    );
  }

  ngOnDestroy(): void {
    [this.user$, this.colorThemeForm$, this.additionalSearchForm$]
      .filter($ => $)
      .forEach($ => $.unsubscribe());
  }

  setConfig(interfaceConfig: any): void {
    // this.authService.userSubject.next({
    //   ...this.user,
    //   interfaceConfig: {
    //     ...this.user.interfaceConfig,
    //     ...interfaceConfig
    //   }
    // });
    //
    // this.localStorageService.setItem(
    //   environment.CONFIG_LOCALSTORAGE,
    //   JSON.stringify(this.authService.userSubject.getValue().interfaceConfig)
    // );
  }
}
