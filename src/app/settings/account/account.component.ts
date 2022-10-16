/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  AuthService,
  User,
  UserService,
  HelperService,
  SnackbarService,
  UserUpdateDto,
  FileService,
  FileGetOneDto,
  FileCreateDto
} from '../../core';
import { pluck, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings-account',
  templateUrl: './account.component.html'
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

  user: User;

  avatarForm: FormGroup;
  avatarForm$: Subscription;
  avatarFormIsSubmitted: boolean;

  accountForm: FormGroup;
  accountForm$: Subscription;
  accountFormIsSubmitted: boolean;

  cropperFile: File;
  cropperModal: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private fileService: FileService
  ) {
    this.avatarForm = this.formBuilder.group({
      url: ['', [this.helperService.getCustomValidator('url-image')]]
    });

    this.accountForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      biography: ['']
    });
  }

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.parent.data
      .pipe(
        pluck('data'),
        tap((user: User) => (this.user = user))
      )
      .subscribe((user: User) => this.accountForm.patchValue(user));
  }

  ngOnDestroy(): void {
    [this.avatarForm$, this.accountForm$, this.accountForm$].forEach($ => $?.unsubscribe());
  }

  onSubmitAvatarForm(): void {
    if (this.helperService.getFormValidation(this.avatarForm)) {
      this.avatarFormIsSubmitted = true;

      const fileGetOneDto: FileGetOneDto = {
        ...this.avatarForm.value
      };

      // prettier-ignore
      this.fileService.getOne(fileGetOneDto).subscribe((file: File) => {
        this.onShowCropper(undefined, file);

        this.avatarFormIsSubmitted = false;
      },
      () => (this.avatarFormIsSubmitted = false)
      );
    }
  }

  onUpdateAvatar(fileCreateDto?: FileCreateDto): void {
    const userUpdateDto: UserUpdateDto = {
      avatar: fileCreateDto?.path || null
    };

    // prettier-ignore
    this.userService.update(this.user.id, userUpdateDto).subscribe((user: User) => {
      this.user = user;

      this.authService.setAuthorization(user);

      if (!!fileCreateDto) {
        this.snackbarService.success('Avatar updated');
      } else {
        this.snackbarService.danger('Avatar deleted');
      }
    });
  }

  onShowCropper(event?: Event, file?: File): void {
    const inputElement: HTMLInputElement = event ? (event.target as HTMLInputElement) : undefined;

    this.cropperFile = inputElement ? inputElement.files.item(0) : file;
    this.cropperModal = true;

    this.avatarForm.reset();
  }

  onCloseCropper(): void {
    this.cropperFile = undefined;
    this.cropperModal = false;
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.accountForm)) {
      this.accountFormIsSubmitted = true;

      const userUpdateDto: UserUpdateDto = {
        ...this.accountForm.value
      };

      // prettier-ignore
      this.userService.update(this.user.id, userUpdateDto).subscribe((user: User) => {
        this.user = user;

        this.authService.setAuthorization(user);

        this.snackbarService.success('Information updated');

        this.accountFormIsSubmitted = false;
      },
      () => (this.accountFormIsSubmitted = false)
      );
    }
  }
}
