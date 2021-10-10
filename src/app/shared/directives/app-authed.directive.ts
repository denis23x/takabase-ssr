/** @format */

import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/core';

@Directive({
  selector: '[appAuthed]'
})
export class AppAuthedDirective implements OnInit, OnDestroy {
  @Input()
  set appAuthed(condition: boolean) {
    this.condition = condition;
  }

  isAuthenticated$: Subscription;
  condition: boolean;

  constructor(
    private templateRef: TemplateRef<any>,
    private authService: AuthService,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if ((isAuthenticated && this.condition) || (!isAuthenticated && !this.condition)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  ngOnDestroy() {
    [this.isAuthenticated$].filter($ => $).forEach($ => $.unsubscribe());
  }
}
