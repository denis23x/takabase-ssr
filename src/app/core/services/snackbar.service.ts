/** @format */

import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Snack, SnackDuration, SnackOptions, SnackProgress } from '../models';

@Injectable()
export class SnackbarService {
	snackbar$: ReplaySubject<Snack> = new ReplaySubject<Snack>();

	getDefaultDuration(duration: number = 4000): SnackDuration {
		return {
			value: duration
		};
	}

	getDefaultProgress(): SnackProgress {
		return {
			value: 0
		};
	}

	// prettier-ignore
	info(title: string | null, message: string, duration?: number, options?: SnackOptions) {
		this.snackbar$.next({
			title,
			message,
			duration: this.getDefaultDuration(duration),
			progress: this.getDefaultProgress(),
			options: {
				classList: 'alert-info text-white',
				...options
			}
		});
	}

	// prettier-ignore
	success(title: string | null, message: string, duration?: number, options?: SnackOptions) {
		this.snackbar$.next({
			title,
			message,
      duration: this.getDefaultDuration(duration),
      progress: this.getDefaultProgress(),
			options: {
				classList: 'alert-success text-white',
				...options
			}
		});
	}

	// prettier-ignore
	warning(title: string | null, message: string, duration?: number, options?: SnackOptions) {
		this.snackbar$.next({
			title,
			message,
      duration: this.getDefaultDuration(duration),
      progress: this.getDefaultProgress(),
			options: {
				classList: 'alert-warning text-black',
				...options
			}
		});
	}

	// prettier-ignore
	danger(title: string | null, message: string, duration?: number, options?: SnackOptions) {
		this.snackbar$.next({
			title,
			message,
      duration: this.getDefaultDuration(duration),
      progress: this.getDefaultProgress(),
			options: {
				classList: 'alert-error text-white',
				...options
			}
		});
	}
}
