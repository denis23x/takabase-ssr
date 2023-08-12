/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Snack } from '../../../core/models/snack.model';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { HelperService } from '../../../core/services/helper.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent],
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

	ngOnInit(): void {
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

	ngOnDestroy(): void {
		[this.snackbar$].forEach($ => $?.unsubscribe());
	}

	onPush(snack: Snack): void {
		const progressTick: number = 10;
		const progressStep: number = (100 / snack.options.duration) * progressTick;

		snack.progress = {
			value: 0,
			interval: setInterval(() => {
				snack.progress.value = snack.progress.value + progressStep;

				if (snack.progress.value >= 100) {
					this.onClose(snack.uuid);

					clearInterval(snack.progress.interval);
				}
			}, progressTick)
		};

		/** Push snack */

		this.snackbarList.push(snack);
	}

	onClose(uuid: string): void {
		// prettier-ignore
		const snack: Partial<Snack> = this.snackbarList.find((snack: Partial<Snack>) => {
      return snack.uuid === uuid;
    });

		/** Stop interval */

		clearInterval(snack.progress.interval);

		/** Filter list */

		this.snackbarList = this.snackbarList.filter((snack: Partial<Snack>) => {
			return snack.uuid !== uuid;
		});
	}
}
