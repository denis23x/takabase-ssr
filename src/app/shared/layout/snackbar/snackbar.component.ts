/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Snack, SnackbarService } from '../../../core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html'
})
export class SnackbarComponent implements OnInit, OnDestroy {
  snackbar: Snack[] = [];
  snackbarService$: Subscription;

  constructor(private snackbarService: SnackbarService) {}

  ngOnInit() {
    this.snackbarService$ = this.snackbarService
      .getObservable()
      .subscribe(snack => this.onSnack(snack));
  }

  ngOnDestroy() {
    [this.snackbarService$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSnack(snack: Snack) {
    this.snackbar.push(snack);

    if (snack.timeout !== 0) {
      const t = setTimeout(() => {
        this.onClose(snack);
        clearTimeout(t);
      }, snack.timeout);
    }
  }

  onClose(snack: Snack) {
    this.snackbar = this.snackbar.filter(({ id }) => id !== snack.id);
  }
}
