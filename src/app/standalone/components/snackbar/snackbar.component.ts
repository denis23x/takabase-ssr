/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Snack } from '../../../core/models/snack.model';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { HelperService } from '../../../core/services/helper.service';

@Component({
	standalone: true,
	imports: [CommonModule],
	selector: 'app-snackbar',
	templateUrl: './snackbar.component.html'
})
export class SnackbarComponent implements OnInit, OnDestroy {
	snackbar$: Subscription | undefined;
	snackbarList: Partial<Snack>[] = [];

	constructor(
		private snackbarService: SnackbarService,
		private helperService: HelperService
	) {}

	ngOnInit() {
		this.snackbar$ = this.snackbarService.snackbar$.subscribe({
			next: (snack: Snack) => {
				this.onPush({
					uuid: this.helperService.getUUID(),
					...snack
				});
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy() {
		[this.snackbar$].forEach($ => $?.unsubscribe());
	}

	onPush(snack: Snack): void {
		/** Start timer */

		snack.duration = {
			...snack.duration,
			timeout: setTimeout(() => {
				this.onClose(snack.uuid);

				clearTimeout(snack.duration.timeout);
			}, snack.duration.value)
		};

		/** Start interval */

		snack.progress = {
			...snack.progress,
			interval: setInterval(() => {
				snack.progress.value++;

				if (snack.progress.value >= 100) {
					clearInterval(snack.progress.interval);
				}
			}, snack.duration.value / 100)
		};

		/** Push snack */

		this.snackbarList.push(snack);
	}

	onClose(uuid: string): void {
		// prettier-ignore
		const snack: Partial<Snack> = this.snackbarList.find((snack: Partial<Snack>) => {
      return snack.uuid === uuid;
    });

		/** Stop timer */

		clearTimeout(snack.duration.timeout);

		/** Stop interval */

		clearInterval(snack.progress.interval);

		/** Filter list */

		this.snackbarList = this.snackbarList.filter((snack: Partial<Snack>) => {
			return snack.uuid !== uuid;
		});
	}
}
