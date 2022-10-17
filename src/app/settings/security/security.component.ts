/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { pluck, switchMap } from 'rxjs/operators';
import { AuthService, LogoutDto, Session, SnackbarService, User } from '../../core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-settings-security',
  templateUrl: './security.component.html'
})
export class SettingsSecurityComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

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
    this.activatedRouteData$ = this.activatedRoute.parent?.data
      .pipe(
        pluck('data'),
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
        error: (error: any) => console.error(error),
        complete: () => console.debug('Activated route parent data subscription complete')
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
      error: (error: any) => console.error(error),
      complete: () => console.debug('Auth service logout subscription complete')
    });
  }
}
