/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { pluck, switchMap } from 'rxjs/operators';
import { AuthService, Session, SnackbarService, User } from '../../core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GetResult } from '@fingerprintjs/fingerprintjs';

@Component({
  selector: 'app-settings-security',
  templateUrl: './security.component.html'
})
export class SettingsSecurityComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  user: User;

  sessionCurrent!: Session;
  sessionList: Session[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(
        pluck('data'),
        switchMap((user: User) => {
          this.user = user;

          return this.authService.getFingerprint();
        })
      )
      .subscribe((getResult: GetResult) => {
        console.log(getResult);

        // https://www.npmjs.com/package/ipinfo

        this.sessionCurrent = this.user.sessions.find((session: Session) => {
          return session.fingerprint === getResult.visitorId;
        });

        this.sessionList = this.user.sessions.filter((session: Session) => {
          return session.fingerprint !== getResult.visitorId;
        });
      });
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onLogout(session?: Session): void {
    if (!!session) {
      this.authService
        .onLogout({
          id: session.id
        })
        .subscribe(() => {
          this.snackbarService.success('Session removed');

          this.sessionList = this.sessionList.filter((session2: Session) => {
            return session2.id !== session.id;
          });
        });
    } else {
      this.authService
        .onLogout({
          reset: 1
        })
        .subscribe(() => this.router.navigateByUrl('/').then(() => console.debug('Route changed')));
    }
  }
}
