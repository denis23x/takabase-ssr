/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { base64ToFile, ImageCroppedEvent } from 'ngx-image-cropper';
import { CropperPosition } from 'ngx-image-cropper/lib/interfaces/cropper-position.interface';
import { ImageTransform } from 'ngx-image-cropper/lib/interfaces/image-transform.interface';

@Component({
  selector: 'app-cropper, [appCropper]',
  templateUrl: './cropper.component.html'
})
export class CropperComponent implements OnInit, OnDestroy {
  @Input()
  set appEvent(event: Event) {
    this.cropperEvent = event;
  }

  cropperModal: boolean;
  cropperEvent: any;
  cropperBase64: any;

  imageTransform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
    translateH: 0,
    translateV: 0
  };

  cropperPosition: CropperPosition = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  };

  cropperPositionInitial: CropperPosition = undefined;

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onSubmitCropper(): void {
    const file: Blob = base64ToFile(this.cropperBase64);

    // const formData: FormData = new FormData();
    //
    // formData.append('avatar', file);
    //
    // this.fileService.create(formData).subscribe(res => {
    //   this.authService.setAuthorization(res);
    //
    //   this.user = res;
    //
    //   this.snackbarService.success('Information updated');
    //
    //   this.onCloseCropper();
    // });
  }

  onImageCropped(imageCroppedEvent: ImageCroppedEvent): void {
    this.cropperBase64 = imageCroppedEvent.base64;

    if (!this.cropperPositionInitial) {
      this.cropperPositionInitial = imageCroppedEvent.cropperPosition;
    }
  }

  onRotate(direction: boolean): void {
    this.imageTransform = {
      ...this.imageTransform,
      rotate: direction ? this.imageTransform.rotate + 45 : this.imageTransform.rotate - 45
    };
  }

  onFlip(direction: boolean): void {
    if (direction) {
      this.imageTransform = {
        ...this.imageTransform,
        flipV: !this.imageTransform.flipV
      };
    } else {
      this.imageTransform = {
        ...this.imageTransform,
        flipH: !this.imageTransform.flipH
      };
    }
  }

  onZoom(direction: boolean): void {
    this.imageTransform = {
      ...this.imageTransform,
      // prettier-ignore
      scale: direction ? this.imageTransform.scale + 1 : this.imageTransform.scale > 1 ? this.imageTransform.scale - 1 : 1
    };
  }

  onTranslateH(direction: boolean): void {
    this.imageTransform = {
      ...this.imageTransform,
      translateH: direction
        ? this.imageTransform.translateH + 5
        : this.imageTransform.translateH - 5
    };
  }

  onTranslateV(direction: boolean): void {
    this.imageTransform = {
      ...this.imageTransform,
      translateV: direction
        ? this.imageTransform.translateV + 5
        : this.imageTransform.translateV - 5
    };
  }

  onTranslateReset(): void {
    this.imageTransform = {
      ...this.imageTransform,
      translateH: 0,
      translateV: 0
    };
  }

  onReset(): void {
    this.imageTransform = {
      scale: 1,
      rotate: 0,
      flipH: false,
      flipV: false,
      translateH: 0,
      translateV: 0
    };

    this.cropperPosition = {
      ...this.cropperPositionInitial
    };
  }
}
