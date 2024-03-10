/** @format */

import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Snack, SnackOptions } from '../models/snack.model';
import { HelperService } from './helper.service';

@Injectable({
	providedIn: 'root'
})
export class SnackbarService {
	private readonly helperService: HelperService = inject(HelperService);

	snackbarList$: BehaviorSubject<Snack[]> = new BehaviorSubject<Snack[]>([]);

	setSnack(snack: Partial<Snack>): void {
		snack.id = this.helperService.getNanoId();
		snack.timestamp = Date.now();

		const timestampStart: number = snack.timestamp;
		const timestampFinish: number = snack.timestamp + snack.options.duration;

		const getProgressValue = (): number => {
			const timestampDifference: number = timestampFinish - timestampStart;
			const timestampCurrent: number = timestampFinish - new Date().getTime();

			return 100 - (timestampCurrent / timestampDifference) * 100;
		};

		// Not affecting hydration

		snack.progress = {
			value: getProgressValue(),
			interval: setInterval(() => {
				snack.progress.value = getProgressValue();

				if (snack.progress.value >= 100) {
					this.removeSnack(snack as Snack);
				}
			}, 30)
		};

		this.snackbarList$.next([...this.snackbarList$.getValue(), snack as Snack]);
	}

	removeSnack(snack: Snack): void {
		clearInterval(snack.progress.interval);

		// prettier-ignore
		this.snackbarList$.next(this.snackbarList$.getValue().filter((snackList: Snack) => {
      return snackList.id !== snack.id;
    }));
	}

	info(title: string | null, message: string, options?: SnackOptions): void {
		this.setSnack({
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

	success(title: string | null, message: string, options?: SnackOptions): void {
		this.setSnack({
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

	warning(title: string | null, message: string, options?: SnackOptions): void {
		this.setSnack({
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

	error(title: string | null, message: string, options?: SnackOptions): void {
		this.setSnack({
			title,
			message,
			options: {
				icon: 'x-circle',
				progress: false,
				duration: 6000,
				alertClassList: 'alert-error',
				progressClassList: 'progress-error',
				...options
			}
		});
	}
}
