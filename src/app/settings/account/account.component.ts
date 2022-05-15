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
import { pluck, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ImageCroppedEvent, LoadedImage, base64ToFile } from 'ngx-image-cropper';

@Component({
  selector: 'app-settings-account',
  templateUrl: './account.component.html'
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

  user: User;

  accountForm: FormGroup;
  accountForm$: Subscription;
  accountFormIsSubmitted: boolean;

  avatarModal: boolean;
  avatarEvent: any;
  avatarCropped: any;

  transform: any = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
    translateH: 0,
    translateV: 0
  };

  cropper: any = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  };

  cropper2: any = undefined;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private fileService: FileService
  ) {
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
    [this.accountForm$].forEach($ => $?.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.accountForm)) {
      this.accountFormIsSubmitted = true;

      const userUpdateDto: UserUpdateDto = {
        ...this.accountForm.value
      };

      this.userService.update(this.user.id, userUpdateDto).subscribe(
        (user: User) => {
          this.authService.setAuthorization(user);

          this.snackbarService.success('Information updated');

          this.accountFormIsSubmitted = false;
        },
        () => (this.accountFormIsSubmitted = false)
      );
    }
  }

  onDeleteUser(): void {
    console.log('onDeleteUser');
  }

  onShowCropper(event: Event): void {
    this.avatarModal = true;
    this.avatarEvent = event;
  }

  onCloseCropper(): void {
    this.avatarModal = false;
    this.avatarEvent = null;
  }

  imageCropped(imageCroppedEvent: ImageCroppedEvent): void {
    if (!this.cropper2) {
      this.cropper2 = imageCroppedEvent.cropperPosition;
    }

    this.avatarCropped = imageCroppedEvent.base64;
  }

  onSubmitAvatar(): void {
    const file: Blob = base64ToFile(this.avatarCropped);

    const formData: FormData = new FormData();

    formData.append('avatar', file);

    this.fileService.create(formData).subscribe(res => {
      this.authService.setAuthorization(res);

      this.user = res;

      this.snackbarService.success('Information updated');

      this.onCloseCropper();
    });
  }

  onRotate(clockwise: boolean): void {
    this.transform = {
      ...this.transform,
      rotate: clockwise ? this.transform.rotate + 45 : this.transform.rotate - 45
    };
  }

  onFlip(position: boolean): void {
    if (position) {
      this.transform = {
        ...this.transform,
        flipV: !this.transform.flipV
      };
    } else {
      this.transform = {
        ...this.transform,
        flipH: !this.transform.flipH
      };
    }
  }

  onZoom(direction: boolean): void {
    this.transform = {
      ...this.transform,
      // prettier-ignore
      scale: direction ? this.transform.scale + 1 : this.transform.scale > 1 ? this.transform.scale - 1 : 1
    };
  }

  onTranslateH(direction: boolean): void {
    this.transform = {
      ...this.transform,
      translateH: direction ? this.transform.translateH + 5 : this.transform.translateH - 5
    };
  }

  onTranslateV(direction: boolean): void {
    this.transform = {
      ...this.transform,
      translateV: direction ? this.transform.translateV + 5 : this.transform.translateV - 5
    };
  }

  onTranslateReset(): void {
    this.transform = {
      ...this.transform,
      translateH: 0,
      translateV: 0
    };
  }

  onReset(): void {
    this.transform = {
      scale: 1,
      rotate: 0,
      flipH: false,
      flipV: false,
      translateH: 0,
      translateV: 0
    };

    this.cropper = {
      ...this.cropper2
    };
  }
}
