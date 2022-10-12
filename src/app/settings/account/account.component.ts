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
  FileService
} from '../../core';
import { filter, pluck, tap } from 'rxjs/operators';
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
      url: ['', [this.helperService.getCustomValidator('url-image'), Validators.required]]
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
      .subscribe((user: User) => {
        this.avatarForm.patchValue({
          url: user.avatar
        });

        this.accountForm.patchValue(user);
      });

    this.avatarForm$ = this.avatarForm.valueChanges
      .pipe(filter(() => this.avatarForm.valid))
      .subscribe((value: any) => {
        this.fileService
          .createByUrl(value)
          .subscribe((file: File) => this.onShowCropper(undefined, file));
      });
  }

  ngOnDestroy(): void {
    [this.avatarForm$, this.accountForm$].forEach($ => $?.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.accountForm)) {
      this.accountFormIsSubmitted = true;

      const userUpdateDto: UserUpdateDto = {
        ...this.accountForm.value
      };

      // prettier-ignore
      this.userService.update(this.user.id, userUpdateDto).subscribe((user: User) => {
        this.authService.setAuthorization(user);

        this.snackbarService.success('Information updated');

        this.accountFormIsSubmitted = false;
      },
      () => (this.accountFormIsSubmitted = false)
      );
    }
  }

  onShowCropper(event?: Event, file?: File): void {
    const inputElement: HTMLInputElement = event ? (event.target as HTMLInputElement) : undefined;

    this.cropperFile = inputElement ? inputElement.files.item(0) : file;
    this.cropperModal = true;
  }

  onCloseCropper(): void {
    this.cropperFile = undefined;
    this.cropperModal = false;
  }

  onSubmitCropper(event: any): void {
    console.log('onSubmitCropper', event);

    // this.onCloseCropper();
  }
}
