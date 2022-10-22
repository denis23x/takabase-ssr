/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data, Router } from '@angular/router';

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
      .pipe(map((data: Data) => data.status))
      .subscribe({
        next: (status: string) => {
          const statusCode: number = Number(status);
          const message: string = this.getMessageMap(statusCode);

          if (!statusCode || !message) {
            this.router.navigate([[], 520]).then(() => console.debug('Route changed'));
          }

          this.statusCode = statusCode;
          this.message = message;
        },
        error: (error: any) => console.error(error),
        complete: () => console.debug('Activated route params subscription complete')
      });
  }

  ngOnDestroy(): void {
    [this.routeParams$].forEach($ => $?.unsubscribe());
  }

  getMessageMap(status: number): string | undefined {
    const index: number = this.statusCodeMap.findIndex(([min, max]: number[]) => {
      return min <= status === status < max;
    });

    return this.messageMap[index];
  }
}
