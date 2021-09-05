/** @format */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User, UserService } from '../../../core';

@Component({
  selector: 'app-header, [appHeader]',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  user$: Observable<User>;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.user$ = this.userService.user;
  }

  onLogout(): void {
    this.router.navigateByUrl('/').then(() => this.userService.removeAuthorization());
  }
}
