/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, UserProfile, Category } from '../core';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  user: User;
  categoryList: Category[] = [];

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((userProfile: UserProfile) => {
        this.user = userProfile.user;
        this.categoryList = userProfile.categoryList;
      });
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }
}
