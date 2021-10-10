/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../../../user/core';

@Component({
  selector: 'app-card-user, [appCardUser]',
  templateUrl: './user.component.html'
})
export class CardUserComponent implements OnInit, OnDestroy {
  @Input()
  set appUser(user: User) {
    this.user = user;
  }

  constructor() {}

  user: User;

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
