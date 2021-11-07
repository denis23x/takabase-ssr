/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../core';
import { pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users-settings',
  templateUrl: './settings.component.html'
})
export class UsersSettingsComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  user: User;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((user: User) => (this.user = user));
  }

  ngOnDestroy() {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }
}
