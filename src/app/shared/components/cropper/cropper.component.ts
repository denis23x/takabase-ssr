/** @format */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { base64ToFile, ImageCroppedEvent } from 'ngx-image-cropper';
import { CropperPosition } from 'ngx-image-cropper/lib/interfaces/cropper-position.interface';
import { ImageTransform } from 'ngx-image-cropper/lib/interfaces/image-transform.interface';
import { FileService } from '../../../core';

@Component({
  selector: 'app-cropper, [appCropper]',
  templateUrl: './cropper.component.html'
})
export class CropperComponent implements OnInit, OnDestroy {
  @Output() closed = new EventEmitter<boolean>();
  @Output() submitted = new EventEmitter<any>();

  @Input()
  set appFile(file: any) {
    this.cropperFile = file;
  }

  @Input()
  set appUrl(url: string) {
    this.cropperUrl = url;
  }

  @Input()
  set appEvent(event: Event) {
    this.cropperEvent = event;
  }

  cropperFile: any;
  cropperUrl: string;
  cropperEvent: Event;
  cropperBase64: string;

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

  constructor(private fileService: FileService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  b64toBlob(b64Data: any, contentType: any, sliceSize?: any): any {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });

    return blob;
  }

  onSubmitCropper(): void {
    // var ImageURL = this.cropperBase64;
    // var block = ImageURL.split(';');
    // var contentType = block[0].split(':')[1]; // In this case "image/gif"
    // var realData = block[1].split(',')[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
    // var blob = this.b64toBlob(realData, contentType);

    const formData: FormData = new FormData();

    formData.append('avatar', base64ToFile(this.cropperBase64));

    this.fileService.create(formData).subscribe(res => {
      // this.authService.setAuthorization(res);
      //
      // this.user = res;
      //
      // this.snackbarService.success('Information updated');
      //
      // this.onCloseCropper();
    });
  }

  onImageLoaded(event: any): void {
    console.log(event);
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

  onClose(): void {
    this.cropperEvent = undefined;
    this.cropperBase64 = undefined;

    this.onReset();

    this.closed.emit(false);
  }
}
