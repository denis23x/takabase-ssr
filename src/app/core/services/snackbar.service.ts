/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Snack, SnackOptions } from '../models/snack.model';

@Injectable({
	providedIn: 'root'
})
export class SnackbarService {
	// prettier-ignore
	snackbar$: BehaviorSubject<Snack | null> = new BehaviorSubject<Snack | null>(null);

	info(title: string | null, message: string, options?: SnackOptions) {
		this.snackbar$.next({
			title,
			message,
			options: {
				icon: 'info-circle',
				progress: true,
				duration: 4000,
				alertClassList: 'alert-info',
				progressClassList: 'progress-info',
				...options
			}
		});
	}

	success(title: string | null, message: string, options?: SnackOptions) {
		this.snackbar$.next({
			title,
			message,
			options: {
				icon: 'check-circle',
				progress: true,
				duration: 3000,
				alertClassList: 'alert-success',
				progressClassList: 'progress-success',
				...options
			}
		});
	}

	warning(title: string | null, message: string, options?: SnackOptions) {
		this.snackbar$.next({
			title,
			message,
			options: {
				icon: 'exclamation-circle',
				progress: false,
				duration: 5000,
				alertClassList: 'alert-warning',
				progressClassList: 'progress-warning',
				...options
			}
		});
	}

	danger(title: string | null, message: string, options?: SnackOptions) {
		this.snackbar$.next({
			title,
			message,
			options: {
				icon: 'x-circle',
				progress: false,
				duration: 5000,
				alertClassList: 'alert-error',
				progressClassList: 'progress-error',
				...options
			}
		});
	}
}
