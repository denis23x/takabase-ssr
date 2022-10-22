/** @format */

import { Component, OnInit } from '@angular/core';
import { User } from '../core';
import { first, map } from 'rxjs/operators';
import { ActivatedRoute, Data } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  user: User;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data
      .pipe(
        first(),
        map((data: Data) => data.data)
      )
      .subscribe({
        next: (user: User) => (this.user = user),
        error: (error: any) => console.error(error)
      });
  }
}
