/** @format */

import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/core';

@Directive({
  selector: '[appAuthed]'
})
export class AppAuthedDirective implements OnInit, OnDestroy {
  @Input()
  set appAuthed(authed: boolean) {
    this.authed = authed;
  }

  isAuthenticated$: Subscription;

  authed: boolean;

  constructor(
    private templateRef: TemplateRef<any>,
    private authService: AuthService,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if ((isAuthenticated && this.authed) || (!isAuthenticated && !this.authed)) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });
  }

  ngOnDestroy(): void {
    [this.isAuthenticated$].filter($ => $).forEach($ => $.unsubscribe());
  }
}
