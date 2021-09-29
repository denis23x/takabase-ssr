/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-exception-status',
  templateUrl: './status.component.html'
})
export class ExceptionStatusComponent implements OnInit, OnDestroy {
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

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeParams$ = this.route.params.pipe(pluck('status')).subscribe((status: string) => {
      const statusCode = Number(status);
      const message = this.getMessageMap(statusCode);

      if (!statusCode || !message) {
        this.router.navigate([[], 404]).then(() => console.debug('Route was changed'));
      }

      this.statusCode = statusCode;
      this.message = message;
    });
  }

  ngOnDestroy(): void {
    [this.routeParams$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getMessageMap(status: number): string | undefined {
    const i = this.statusCodeMap.findIndex(([min, max]) => min <= status === status < max);

    return this.messageMap[i];
  }
}
