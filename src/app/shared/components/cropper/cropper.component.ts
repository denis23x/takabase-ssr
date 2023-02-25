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
		AppInputOnlyPasteDirective
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
		private fileService: FileService
	) {
		this.imageForm = this.formBuilder.group<ImageForm>({
			url: this.formBuilder.nonNullable.control('', [Validators.required])
		});
	}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		// prettier-ignore
		this.imageTransform$ = this.imageCropper.transformChange.subscribe((imageTransform: ImageTransform) => {
      this.imageTransform = imageTransform;
    });
	}

	ngOnDestroy(): void {
		[this.imageTransform$].forEach($ => $?.unsubscribe());
	}

	onInputUrl(): void {
		const abstractControl: AbstractControl = this.imageForm.get('url');

		abstractControl.setValue('');

		// prettier-ignore
		abstractControl.setValidators([Validators.required, this.helperService.getCustomValidator('url-image')]);

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
					error: () => (this.imageFormIsSubmitted = false)
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

		this.setUpdateAndValidityImageForm(file.name);
	}

	onResetImageForm(): void {
		this.imageFormFile.nativeElement.value = '';

		this.setUpdateAndValidityImageForm('');

		this.onResetCropper();
	}

	setUpdateAndValidityImageForm(value: string): void {
		const abstractControl: AbstractControl = this.imageForm.get('url');

		abstractControl.setValue(value);
		abstractControl.setValidators([Validators.required]);
		abstractControl.updateValueAndValidity();
		abstractControl.markAsTouched();
	}

	onImageCropped(imageCroppedEvent: ImageCroppedEvent): void {
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

	onImageReset(): void {
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
		this.onImageReset();

		this.cropperFile = undefined;
		this.cropperBase64 = undefined;
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

				this.onResetCropper();

				this.submitted.emit(fileCreateDto);
			},
			error: () => (this.cropperIsSubmitted = false)
		});
	}
}
