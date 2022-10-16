/** @format */

import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HelperService } from '../core';

@Component({
  selector: 'app-ui',
  templateUrl: './ui.component.html'
})
export class UiComponent {
  colorList: string[] = [
    'white',
    'black',
    'primary-1',
    'primary-2',
    'primary-3',
    'primary-4',
    'secondary-1',
    'secondary-2',
    'info-1',
    'success-1',
    'warning-1',
    'danger-1'
  ];

  typographyList: string[] = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs'];

  buttonList: string[] = ['primary', 'info', 'success', 'warning', 'danger', 'transparent'];

  inputForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder, private helperService: HelperService) {
    this.inputForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      // prettier-ignore
      password: ['', [Validators.required, Validators.pattern(this.helperService.getRegex('password'))]],
      query: ['', [Validators.minLength(4), Validators.maxLength(24)]]
    });
  }
}
