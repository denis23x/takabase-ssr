/** @format */

import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HelperService } from '../core';

interface InputForm {
  email: FormControl<string>;
  password: FormControl<string>;
  query: FormControl<string>;
}

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

  inputForm: FormGroup | undefined;

  constructor(private formBuilder: FormBuilder, private helperService: HelperService) {
    this.inputForm = this.formBuilder.group<InputForm>({
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.control('', [
        Validators.required,
        Validators.pattern(this.helperService.getRegex('password'))
      ]),
      query: this.formBuilder.control('', [Validators.minLength(4), Validators.maxLength(24)])
    });
  }
}
