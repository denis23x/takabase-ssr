/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { AuthService, LogoutDto, Session, SnackbarService, User } from '../../core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings-security',
  templateUrl: './security.component.html'
})
export class SettingsSecurityComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription | undefined;

  user: User | undefined;

  sessionCurrent: Session | undefined;
  sessionList: Session[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.parent?.data
      .pipe(
        map((data: Data) => data.data),
        switchMap((user: User) => {
          this.user = user;

          return this.authService.getFingerprint();
        })
      )
      .subscribe({
        next: (fingerprint: string) => {
          // prettier-ignore
          const [sessionCurrent, ...sessionList]: Session[] = this.user.sessions.sort((session: Session) => {
            return session.fingerprint === fingerprint ? -1 : 1;
          });

          this.sessionCurrent = sessionCurrent;
          this.sessionList = sessionList;
        },
        error: (error: any) => console.error(error)
      });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$].forEach($ => $?.unsubscribe());
  }

  onSessionTerminate(id: number): void {
    const logoutDto: LogoutDto = {
      id
    };

    this.authService.onLogout(logoutDto).subscribe({
      next: () => {
        this.sessionList = this.sessionList.filter((session: Session) => session.id !== id);

        this.snackbarService.success('Session terminated');
      },
      error: (error: any) => console.error(error)
    });
  }
}
