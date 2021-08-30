/** @format */

import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { fadeRouting } from './app.animation';
import { PlatformService, UserService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [fadeRouting]
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'draft-ssr';

  constructor(
    private userService: UserService,
    private platformService: PlatformService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.userService.getAuthorization();
  }

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
      this.renderer.selectRootElement('.pre-loader').remove();
    }
  }
}
