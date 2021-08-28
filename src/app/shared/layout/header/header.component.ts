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
  currentUser$: Observable<User>;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser$ = this.userService.currentUser;
  }

  onLogout(): void {
    this.router.navigateByUrl('/').then(() => this.userService.removeAuthorization());
  }
}
