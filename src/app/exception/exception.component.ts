/** @format */

import { Component, OnInit } from '@angular/core';
import { first, map } from 'rxjs/operators';
import { ActivatedRoute, Data, Router } from '@angular/router';

@Component({
  templateUrl: './exception.component.html'
})
export class ExceptionComponent implements OnInit {
  statusCode: number | undefined;
  statusCodeMap: number[][] = [
    [100, 199],
    [200, 299],
    [300, 399],
    [400, 499],
    [500, 599]
  ];

  message: string | undefined;
  messageMap: string[] = [
    'Information message',
    'Success',
    'Redirect',
    'Client error',
    'Server error'
  ];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        first(),
        map((data: Data) => data.status)
      )
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
        error: (error: any) => console.error(error)
      });
  }

  getMessageMap(status: number): string | undefined {
    const index: number = this.statusCodeMap.findIndex(([min, max]: number[]) => {
      return min <= status === status < max;
    });

    return this.messageMap[index];
  }
}
