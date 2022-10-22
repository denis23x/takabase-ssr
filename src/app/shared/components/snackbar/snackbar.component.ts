/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HelperService, Snack, SnackbarService } from '../../../core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html'
})
export class SnackbarComponent implements OnInit, OnDestroy {
  snackbar$!: Subscription;
  snackbarList: Snack[] = [];

  constructor(private snackbarService: SnackbarService, private helperService: HelperService) {}

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
    this.snackbarList.push(snack);

    if (snack.options.duration !== 0) {
      const timeout = setTimeout(() => {
        this.onClose(snack.uuid);

        clearTimeout(timeout);
      }, snack.options.duration);
    }
  }

  onClose(uuid: string): void {
    this.snackbarList = this.snackbarList.filter((snack: Snack) => snack.uuid !== uuid);
  }
}
