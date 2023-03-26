/** @format */

import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {
	ImageCroppedEvent,
	ImageCropperComponent,
	ImageCropperModule
} from 'ngx-image-cropper';
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
import { FileGetOneDto } from '../../../core/dto/file/file-get-one.dto';
import { AppInputOnlyPasteDirective } from '../../directives/app-input-only-paste.directive';
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { AppInputMarkAsTouchedDirective } from '../../directives/app-input-mark-as-touched.directive';
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
		AppInputTrimWhitespaceDirective,
		AppInputMarkAsTouchedDirective
	],
	selector: 'app-cropper, [appCropper]',
	templateUrl: './cropper.component.html'
})
export class CropperComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('imageFormFile') imageFormFile: ElementRef | undefined;

	// prettier-ignore
	@ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent | undefined;

	@Input()
	set appField(field: string) {
		this.cropperField = field;
	}

	@Input()
	set appRound(round: boolean) {
		this.cropperRound = round;
	}

	// prettier-ignore
	@Output() submitted: EventEmitter<FileCreateDto> = new EventEmitter<FileCreateDto>();

	imageForm: FormGroup | undefined;
	imageFormIsSubmitted: boolean = false;

	imageTransform$: Subscription | undefined;
	imageTransform: ImageTransform = {
		scale: 1,
		rotate: 0,
		flipH: false,
		flipV: false,
		translateH: 0,
		translateV: 0
	};

	cropperField: string | undefined;
	cropperFile: File = undefined;
	cropperRound: boolean = false;
	cropperBase64: string = undefined;
	cropperBackgroundIsDraggable: boolean = false;
	cropperIsAvailable: boolean = false;
	cropperIsSubmitted: boolean = false;

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

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		this.imageTransform$ = this.imageCropper.transformChange.subscribe({
			next: (imageTransform: ImageTransform) => {
				this.imageTransform = imageTransform;
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.imageTransform$].forEach($ => $?.unsubscribe());
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
				this.imageFormIsSubmitted = true;

				const fileGetOneDto: FileGetOneDto = {
					...this.imageForm.value
				};

				this.fileService.getOne(fileGetOneDto).subscribe({
					next: (file: File) => {
						this.cropperPositionInitial = undefined;
						this.cropperFile = file;

						this.imageFormIsSubmitted = false;
					},
					error: () => {
						this.imageFormIsSubmitted = false;

						/** Reset only imageForm because cropper not initialized */

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

		this.cropperPositionInitial = undefined;
		this.cropperFile = file;

		this.onResetImageForm(file.name);
	}

	onImageFailed(): void {
		this.snackbarService.danger('Error', 'Invalid image type');

		this.onResetImageForm('');
		this.onResetCropper();
	}

	onImageCropped(imageCroppedEvent: ImageCroppedEvent): void {
		this.cropperIsAvailable = true;
		this.cropperBase64 = imageCroppedEvent.base64;

		if (!this.cropperPositionInitial) {
			this.cropperPositionInitial = imageCroppedEvent.cropperPosition;
		}
	}

	onImageRotate(direction: boolean): void {
		this.imageTransform = {
			...this.imageTransform,
			rotate: direction
				? this.imageTransform.rotate + 15
				: this.imageTransform.rotate - 15
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
		this.cropperBase64 = undefined;
		this.cropperIsAvailable = false;
	}

	onResetImageForm(value: string): void {
		const abstractControl: AbstractControl = this.imageForm.get('url');

		abstractControl.setValue(value);
		abstractControl.setValidators([Validators.required]);
		abstractControl.updateValueAndValidity();
		abstractControl.markAsTouched();
	}

	// prettier-ignore
	async setBase64ToFile(base64: string, filename: string, mimeType: string): Promise<File> {
		const response: Response = await fetch(base64);
		const arrayBuffer: ArrayBuffer = await response.arrayBuffer();

		return new File([arrayBuffer], filename, { type: mimeType });
	}

	async onSubmitCropper(): Promise<void> {
		// prettier-ignore
		const file: File = await this.setBase64ToFile(this.cropperBase64, this.cropperFile.name, this.cropperFile.type);

		const formData: FormData = new FormData();

		formData.append(this.cropperField, file);

		this.cropperIsSubmitted = true;

		this.fileService.create(formData).subscribe({
			next: (fileCreateDto: FileCreateDto) => {
				this.cropperIsSubmitted = false;

				this.submitted.emit(fileCreateDto);
			},
			error: () => (this.cropperIsSubmitted = false)
		});
	}
}
