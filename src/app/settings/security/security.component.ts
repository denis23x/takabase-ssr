/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { pluck } from 'rxjs/operators';
import { AuthService, Session, User } from '../../core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-settings-security',
  templateUrl: './security.component.html'
})
export class SettingsSecurityComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  user: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((user: User) => (this.user = user));
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onLogout(session: Session): void {
    console.log(session);
    // this.authService
    //   .onLogout({
    //     fingerprint: session.fingerprint
    //   })
    //   .subscribe(() => this.router.navigateByUrl('/').then(() => console.debug('Route changed')));
  }

  onLogoutAll(): void {
    // this.authService
    //   .onLogout({
    //     fingerprint: 'any',
    //     reset: 1
    //   })
    //   .subscribe(() => {
    //     console.log('onLogoutAll');
    //   });
  }
}
