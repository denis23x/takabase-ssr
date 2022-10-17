/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../core';
import { pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

  user: User;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRouteData$ = this.activatedRoute.data.pipe(pluck('data')).subscribe({
      next: (user: User) => (this.user = user),
      error: (error: any) => console.error(error),
      complete: () => console.debug('Activated route data subscription complete')
    });
  }

  ngOnDestroy() {
    [this.activatedRouteData$].forEach($ => $?.unsubscribe());
  }
}
