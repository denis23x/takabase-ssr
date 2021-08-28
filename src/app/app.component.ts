/** @format */

import { Component } from '@angular/core';
import { fadeRouting } from './app.animation';
import { UserService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [fadeRouting]
})
export class AppComponent {
  title = 'draft-ssr';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getAuthorization();
  }
}
