/** @format */

import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	OnDestroy,
	Output,
	ViewChild
} from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent, ImageCropperModule } from 'ngx-image-cropper';
import { CropperPosition } from 'ngx-image-cropper/lib/interfaces/cropper-position.interface';
import { ImageTransform } from 'ngx-image-cropper/lib/interfaces/image-transform.interface';
import { Subscription } from 'rxjs';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { FileCreateDto } from '../../../core/dto/file/file-create.dto';
import { HelperService } from '../../../core/services/helper.service';
import { FileService } from '../../../core/services/file.service';
import { FileGetOneProxyDto } from '../../../core/dto/file/file-get-one-proxy.dto';
import { AppInputOnlyPasteDirective } from '../../directives/app-input-only-paste.directive';
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../../core/services/snackbar.service';

interface ImageForm {
	url: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ImageCropperModule,
		SvgIconComponent,
		AppInputOnlyPasteDirective,
		AppInputTrimWhitespaceDirective
	],
	selector: 'app-cropper, [appCropper]',
	templateUrl: './cropper.component.html'
})
export class CropperComponent implements AfterViewInit, OnDestroy {
	@ViewChild('imageFormFile') imageFormFile: ElementRef<HTMLInputElement> | undefined;
	@ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent | undefined;

	@Output() submitted: EventEmitter<FileCreateDto> = new EventEmitter<FileCreateDto>();

	imageForm: FormGroup | undefined;
	imageFormMime: string[] = ['image/jpeg', 'image/jpg', 'image/png'];

	imageTransform$: Subscription | undefined;
	imageTransform: ImageTransform = {
		scale: 1,
		rotate: 0,
		flipH: false,
		flipV: false,
		translateH: 0,
		translateV: 0
	};

	cropperFile: File = undefined;
	cropperRound: boolean = false;
	cropperBlob: Blob = undefined;
	cropperBackgroundIsDraggable: boolean = false;
	cropperIsAvailable: boolean = false;

	cropperPositionInitial: CropperPosition = undefined;
	cropperPosition: CropperPosition = {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0
	};

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private fileService: FileService,
		private snackbarService: SnackbarService
	) {
		this.imageForm = this.formBuilder.group<ImageForm>({
			url: this.formBuilder.nonNullable.control('', [Validators.required])
		});
	}

	ngAfterViewInit(): void {
		this.imageTransform$ = this.imageCropper.transformChange.subscribe({
			next: (imageTransform: ImageTransform) => (this.imageTransform = imageTransform),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.imageTransform$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onInputUrl(): void {
		const abstractControl: AbstractControl = this.imageForm.get('url');

		abstractControl.setValidators([
			Validators.required,
			Validators.pattern(this.helperService.getRegex('url'))
		]);

		abstractControl.updateValueAndValidity();

		const validationTimeout = setTimeout(() => {
			if (this.helperService.getFormValidation(this.imageForm)) {
				this.imageForm.disable();

				const fileGetOneProxyDto: FileGetOneProxyDto = {
					...this.imageForm.value
				};

				this.fileService.getOneProxy(fileGetOneProxyDto).subscribe({
					next: (blob: Blob) => {
						this.cropperPositionInitial = undefined;
						this.cropperFile = new File([blob], 'blob-image', {
							type: blob.type
						});

						this.imageForm.enable();
					},
					error: () => {
						this.imageForm.enable();

						/** Reset only imageForm because cropper not initialized yet */

						this.onResetImageForm('');
					}
				});
			}

			clearTimeout(validationTimeout);
		});
	}

	onInputFile(event: Event): void {
		const inputElement: HTMLInputElement = event.target as HTMLInputElement;
		const file: File = inputElement.files.item(0);

		const fileValidation: Record<string, any> = {
			mime: {
				valid: this.fileService.getFileValidationMime(file, this.imageFormMime),
				message: 'Invalid image type'
			},
			type: {
				valid: this.fileService.getFileValidationSize(file, 5),
				message: 'Invalid image size'
			}
		};

		if (Object.values(fileValidation).every((file: any) => file.valid)) {
			this.cropperPositionInitial = undefined;
			this.cropperFile = file;

			this.onResetImageForm(file.name);
		} else {
			this.onResetAll();

			Object.values(fileValidation)
				.filter((file: any) => !file.valid)
				.forEach((file: any) => this.snackbarService.danger('Error', file.message));
		}
	}

	onImageFailed(): void {
		this.snackbarService.danger('Error', 'Invalid image type');

		this.onResetImageForm('');
		this.onResetCropper();
	}

	onImageCropped(imageCroppedEvent: ImageCroppedEvent): void {
		this.cropperIsAvailable = true;
		this.cropperBlob = imageCroppedEvent.blob;

		if (!this.cropperPositionInitial) {
			this.cropperPositionInitial = imageCroppedEvent.cropperPosition;
		}
	}

	onImageRotate(direction: boolean): void {
		this.imageTransform = {
			...this.imageTransform,
			rotate: direction ? this.imageTransform.rotate + 15 : this.imageTransform.rotate - 15
		};
	}

	onImageFlip(direction: boolean): void {
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

	onImageZoom(direction: boolean): void {
		this.imageTransform = {
			...this.imageTransform,
			// prettier-ignore
			scale: direction ? this.imageTransform.scale + 0.25 : this.imageTransform.scale > 1 ? this.imageTransform.scale - 0.25 : 1
		};
	}

	onResetAll(): void {
		this.imageFormFile.nativeElement.value = '';

		this.onResetImageForm('');
		this.onResetTransform();
		this.onResetCropper();
	}

	onResetTransform(): void {
		this.imageTransform = {
			scale: 1,
			rotate: 0,
			flipH: false,
			flipV: false,
			translateH: 0,
			translateV: 0
		};

		this.cropperBackgroundIsDraggable = false;

		this.cropperPosition = {
			...this.cropperPositionInitial
		};
	}

	onResetCropper(): void {
		this.cropperFile = undefined;
		this.cropperBlob = undefined;
		this.cropperIsAvailable = false;
	}

	onResetImageForm(value: string): void {
		const abstractControl: AbstractControl = this.imageForm.get('url');

		abstractControl.setValue(value);
		abstractControl.setValidators([Validators.required]);
		abstractControl.updateValueAndValidity();
		abstractControl.markAsTouched();
	}

	onSubmitCropper(): void {
		const fileCropped: File = new File([this.cropperBlob], this.cropperFile.name, {
			type: this.cropperFile.type
		});

		const formData: FormData = new FormData();

		formData.append('image', fileCropped);

		this.imageForm.disable();

		this.fileService.create(formData).subscribe({
			next: (fileCreateDto: FileCreateDto) => {
				this.imageForm.enable();

				this.submitted.emit(fileCreateDto);
			},
			error: () => this.imageForm.enable()
		});
	}
}
