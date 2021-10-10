/** @format */

import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { fadeRouting } from './app.animation';
import { PlatformService } from './core';
import { AuthService } from './auth/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [fadeRouting]
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'draft-ssr';

  constructor(
    private authService: AuthService,
    private platformService: PlatformService,
    private renderer2: Renderer2
  ) {}

  ngOnInit(): void {
    this.authService.getAuthorization();
  }

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
      this.renderer2.selectRootElement('.pre-loader').remove();
    }
  }
}
