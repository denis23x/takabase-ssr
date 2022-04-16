/** @format */

import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService, PlatformService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
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
      this.renderer2.selectRootElement('#loader').remove();
    }
  }
}
