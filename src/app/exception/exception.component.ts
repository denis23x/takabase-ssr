/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './exception.component.html'
})
export class ExceptionComponent implements OnInit, OnDestroy {
  routeParams$: Subscription;

  statusCode: number;
  statusCodeMap: number[][] = [
    [100, 199],
    [200, 299],
    [300, 399],
    [400, 499],
    [500, 599]
  ];

  message: string;
  messageMap: string[] = [
    'Information message',
    'Success',
    'Redirect',
    'Client error',
    'Server error'
  ];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeParams$ = this.activatedRoute.params
      .pipe(pluck('status'))
      .subscribe((status: string) => {
        const statusCode: number = Number(status);
        const message: string = this.getMessageMap(statusCode);

        if (!statusCode || !message) {
          this.router.navigate([[], 520]).then(() => console.debug('Route changed'));
        }

        this.statusCode = statusCode;
        this.message = message;
      });
  }

  ngOnDestroy(): void {
    [this.routeParams$].forEach($ => $?.unsubscribe());
  }

  getMessageMap(status: number): string | undefined {
    const i = this.statusCodeMap.findIndex(([min, max]) => min <= status === status < max);

    return this.messageMap[i];
  }
}
