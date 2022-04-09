/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { pluck, switchMap } from 'rxjs/operators';
import { AuthService, Session, SnackbarService, User } from '../../core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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
      .subscribe((fingerprint: string) => {
        // prettier-ignore
        const [sessionCurrent, ...sessionList]: Session[] = this.user.sessions.sort((session: Session) => {
          return session.fingerprint === fingerprint ? -1 : 1;
        });

        this.sessionCurrent = sessionCurrent;
        this.sessionList = sessionList;
      });
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSessionTerminate(id: number): void {
    this.authService.onLogout({ id }).subscribe(() => {
      this.sessionList = this.sessionList.filter((session: Session) => session.id !== id);

      this.snackbarService.success('Session terminated');
    });
  }
}
