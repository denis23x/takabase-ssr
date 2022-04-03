/** @format */

import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PlatformService } from './platform.service';

@Injectable()
export class HelperService {
  constructor(private platformService: PlatformService) {}

  getRegex(regex: string): RegExp {
    switch (regex) {
      case 'password':
        return /^((?=.*\d)|(?=.*[!@#$%^&*]))(?=.*[a-zA-Z]).{6,32}$/;
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
    return (abstractControl: AbstractControl): ValidationErrors | null => {
      const value = abstractControl.value;
      const valid = (value: string): boolean => {
        switch (validator) {
          case 'url-youtube':
          case 'url-gist':
          case 'url-image':
          case 'url-link':
            return this.getRegex(validator).test(value);
          default:
            return true;
        }
      };

      if (value) {
        return valid(value) ? null : { customValidator: { value } };
      }

      return null;
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

  getUUID(): string {
    if (this.platformService.isBrowser()) {
      const window: Window = this.platformService.getWindow();

      // @ts-ignore
      const source: string = [1e7] + -1e3 + -4e3 + -8e3 + -1e11;
      const getUUID = (n: string): string => {
        const m = Number(n);
        const uint8Array: Uint8Array = window.crypto.getRandomValues(new Uint8Array(1));

        return (m ^ (uint8Array[0] & (15 >> (m / 4)))).toString(16);
      };

      return source.replace(/[018]/g, getUUID);
    }

    return (Math.random() + 1).toString(36).substring(7);
  }
}
