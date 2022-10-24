/** @format */

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CropperPosition } from 'ngx-image-cropper/lib/interfaces/cropper-position.interface';
import { ImageTransform } from 'ngx-image-cropper/lib/interfaces/image-transform.interface';
import { FileCreateDto, FileService } from '../../../core';

@Component({
  selector: 'app-cropper, [appCropper]',
  templateUrl: './cropper.component.html'
})
export class CropperComponent implements OnInit {
  @ViewChild('cropperContent') cropperContent: ElementRef | undefined;

  @Output() closed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() submitted: EventEmitter<FileCreateDto> = new EventEmitter<FileCreateDto>();

  @Input()
  set appFile(file: File) {
    this.cropperFile = file;
  }

  cropperFile: File = undefined;
  cropperBase64: string = undefined;
  cropperIsScrollable: boolean = false;

  imageTransform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false,
    translateH: 0,
    translateV: 0
  };

  cropperPositionInitial: CropperPosition = undefined;
  cropperPosition: CropperPosition = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  };

  constructor(private fileService: FileService) {}

  ngOnInit(): void {}

  onImageCropped(imageCroppedEvent: ImageCroppedEvent): void {
    this.cropperBase64 = imageCroppedEvent.base64;

    if (!this.cropperPositionInitial) {
      this.cropperPositionInitial = imageCroppedEvent.cropperPosition;
    }

    /** Set cropperIsScrollable */

    const content: HTMLElement = this.cropperContent.nativeElement;
    const contentFirstChild: HTMLElement = content.firstChild as HTMLElement;
    const contentFirstChildMargin: number = 32;

    // prettier-ignore
    this.cropperIsScrollable = content.clientHeight - contentFirstChildMargin < contentFirstChild.clientHeight;
  }

  onRotate(direction: boolean): void {
    this.imageTransform = {
      ...this.imageTransform,
      rotate: direction ? this.imageTransform.rotate + 15 : this.imageTransform.rotate - 15
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
        ? this.imageTransform.translateH + 2.5
        : this.imageTransform.translateH - 2.5
    };
  }

  onTranslateV(direction: boolean): void {
    this.imageTransform = {
      ...this.imageTransform,
      translateV: direction
        ? this.imageTransform.translateV + 2.5
        : this.imageTransform.translateV - 2.5
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
    this.cropperFile = undefined;
    this.cropperBase64 = undefined;

    this.onReset();

    this.closed.emit(false);
  }

  async base64ToFile(base64: string, filename: string, mimeType: string): Promise<File> {
    const response: Response = await fetch(base64);
    const arrayBuffer: ArrayBuffer = await response.arrayBuffer();

    return new File([arrayBuffer], filename, { type: mimeType });
  }

  async onSubmitCropper(): Promise<void> {
    const file: File = await this.base64ToFile(
      this.cropperBase64,
      this.cropperFile.name,
      this.cropperFile.type
    );

    const formData: FormData = new FormData();

    formData.append('avatars', file);

    this.fileService.create(formData).subscribe({
      next: (fileCreateDto: FileCreateDto) => {
        this.submitted.emit(fileCreateDto);

        this.onClose();
      },
      error: (error: any) => console.error(error)
    });
  }
}
