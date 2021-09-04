/** @format */

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HelperService, LocalStorageService } from '../../core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-users-settings',
  templateUrl: './settings.component.html'
})
export class UsersSettingsComponent implements OnInit, OnDestroy {
  queryParams$: Subscription;

  settingsForm: FormGroup;
  settingsForm$: Subscription;

  isSubmitting = false;

  constructor(
    @Inject(DOCUMENT)
    private document: Document,
    private fb: FormBuilder,
    private helperService: HelperService,
    private localStorageService: LocalStorageService
  ) {
    this.settingsForm = this.fb.group({
      theme: ['', [Validators.required]],
      enableSearchPostList: [false, [Validators.required]],
      enableSearchCategoryList: [false, [Validators.required]],
      enableSearchUserList: [false, [Validators.required]]
    });
  }

  ngOnInit() {
    const test$ = this.settingsForm.get('theme')?.valueChanges.subscribe(value => {
      this.document.body.classList.remove('auto');
      this.document.body.classList.remove('dark');
      this.document.body.classList.remove('light');

      // const hasClass = this.document.body.classList.value.includes(value);

      this.document.body.classList.add(value);
    });

    // this.settingsForm$ = this.settingsForm.valueChanges.subscribe(value => {
    //   console.log(value);
    //   // this.localStorageService.setItem('config', JSON.stringify(value));
    // });

    // const config = JSON.parse(this.localStorageService.getItem('config') || '{}');
    //
    // if (config && Object.keys(config).length) {
    //   this.settingsForm.setValue(config);
    // }
  }

  ngOnDestroy() {
    this.settingsForm$?.unsubscribe();
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.settingsForm)) {
      console.log('all good!');
    }
  }
}
