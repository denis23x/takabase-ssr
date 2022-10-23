/** @format */

import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core';
import { tap } from 'rxjs/operators';

@Directive({
  selector: '[appAuthenticated]'
})
export class AppAuthenticatedDirective implements OnInit, OnDestroy {
  @Input()
  set appAuthenticated(authenticated: boolean) {
    this.authenticated = authenticated;
  }

  authenticated$: Subscription | undefined;
  authenticated: boolean = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private authService: AuthService,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.authenticated$ = this.authService.userAuthenticated
      .pipe(tap(() => this.viewContainerRef.clear()))
      .subscribe({
        next: (userAuthenticated: boolean) => {
          // prettier-ignore
          if ((userAuthenticated && this.authenticated) || (!userAuthenticated && !this.authenticated)) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
          } else {
            this.viewContainerRef.clear();
          }
        },
        error: (error: any) => console.error(error)
      });
  }

  ngOnDestroy(): void {
    [this.authenticated$].forEach($ => $?.unsubscribe());
  }
}
