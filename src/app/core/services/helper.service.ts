/** @format */

import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

@Injectable()
export class HelperService {
  constructor() {}

  getRegex(regex: string): RegExp {
    switch (regex) {
      case 'password':
        return /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){6,32}$/;
      case 'url-youtube':
        return /^https:\/\/(www\.)?youtube\.com\/watch\?v=(\S{11})\S*$/;
      case 'url-gist':
        return /^https:\/\/(www\.)?gist\.github\.com\/(\S+)\/(\S{32})\S*$/;
      case 'url-image':
        return /^(https?|ftp)?:\/\/(www\.)?\S+\.(jpeg|jpg|png|gif|bmp)\S*$/;
      case 'url-link':
        return /^(https?|ftp)?:\/\/(www\.)?\S+\.\S+$/;
      default:
        throw new Error(`Invalid regex type specified: ${regex}`);
    }
  }

  getCustomValidator(validator: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = (): boolean => {
        switch (validator) {
          case 'url-youtube':
          case 'url-gist':
          case 'url-image':
          case 'url-link':
            return !this.getRegex(validator).test(control.value);
          default:
            return true;
        }
      };

      return valid() ? { invalidCustomValidator: { value: control.value } } : null;
    };
  }

  getFormValidation(formGroup: FormGroup): boolean {
    if (formGroup.invalid) {
      Object.keys(formGroup.controls).forEach(control =>
        formGroup.get(control).markAsTouched({ onlySelf: true })
      );

      return false;
    }

    return true;
  }
}
