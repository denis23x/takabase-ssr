/** @format */

import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { pairwise, pluck, startWith } from 'rxjs/operators';
import { PlatformService } from '../../../core';

@Component({
  selector: 'app-users-settings-interface',
  templateUrl: './interface.component.html'
})
export class UsersSettingsInterfaceComponent implements OnInit, OnDestroy {
  colorThemeForm: FormGroup;
  colorThemeForm$: Subscription;

  additionalSearchForm: FormGroup;
  additionalSearchForm$: Subscription;

  isSubmitting = false;

  constructor(
    @Inject(DOCUMENT)
    private document: Document,
    private renderer2: Renderer2,
    private fb: FormBuilder,
    private platformService: PlatformService
  ) {
    this.colorThemeForm = this.fb.group({
      theme: ['auto', [Validators.required]]
    });

    this.additionalSearchForm = this.fb.group({
      users: [false, [Validators.required]],
      categories: [false, [Validators.required]]
    });
  }

  ngOnInit() {
    this.colorThemeForm$ = this.colorThemeForm.valueChanges
      .pipe(pluck('theme'), startWith(this.colorThemeForm.get('theme')?.value), pairwise())
      .subscribe(([previousClassName, currentClassName]) => {
        if (this.platformService.isBrowser()) {
          this.renderer2.removeClass(this.document.body, previousClassName);
          this.renderer2.addClass(this.document.body, currentClassName);
        }
      });

    this.additionalSearchForm$ = this.additionalSearchForm.valueChanges.subscribe(value => {
      console.log('Handle config', value);
    });
  }

  ngOnDestroy() {
    [this.colorThemeForm$, this.additionalSearchForm$].forEach($ => $?.unsubscribe());
  }
}
