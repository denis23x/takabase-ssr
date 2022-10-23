/** @format */

import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Snack, SnackOptions } from '../models';

@Injectable()
export class SnackbarService {
  snackbar$: ReplaySubject<Snack> = new ReplaySubject<Snack>();

  info(message: string, snackOptions?: SnackOptions) {
    this.snackbar$.next({
      message,
      options: {
        classList: 'bg-info-1 text-white',
        duration: 4000,
        ...snackOptions
      }
    });
  }

  success(message: string, snackOptions?: SnackOptions) {
    this.snackbar$.next({
      message,
      options: {
        classList: 'bg-success-1 text-white',
        duration: 4000,
        ...snackOptions
      }
    });
  }

  warning(message: string, snackOptions?: SnackOptions) {
    this.snackbar$.next({
      message,
      options: {
        classList: 'bg-warning-1 text-black',
        duration: 5000,
        ...snackOptions
      }
    });
  }

  danger(message: string, snackOptions?: SnackOptions) {
    this.snackbar$.next({
      message,
      options: {
        classList: 'bg-danger-1 text-white',
        duration: 5000,
        ...snackOptions
      }
    });
  }
}
