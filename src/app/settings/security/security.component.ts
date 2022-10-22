/** @format */

import { Component, OnInit } from '@angular/core';
import { first, map, switchMap } from 'rxjs/operators';
import { AuthService, LogoutDto, Session, SnackbarService, User } from '../../core';
import { ActivatedRoute, Data, Router } from '@angular/router';

@Component({
  selector: 'app-settings-security',
  templateUrl: './security.component.html'
})
export class SettingsSecurityComponent implements OnInit {
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
    this.activatedRoute.parent?.data
      .pipe(
        first(),
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
