/** @format */

import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { CropperPosition } from 'ngx-image-cropper/lib/interfaces/cropper-position.interface';
import { ImageTransform } from 'ngx-image-cropper/lib/interfaces/image-transform.interface';
import {
	FileCreateDto,
	FileGetOneDto,
	FileService,
	HelperService,
	User
} from '../../../core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

interface ImageForm {
	url: FormControl<string>;
	name: FormControl<string>;
}

@Component({
	selector: 'app-cropper, [appCropper]',
	templateUrl: './cropper.component.html'
})
export class CropperComponent implements OnInit, AfterViewInit, OnDestroy {
	// prettier-ignore
	@ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent | undefined;

	@Input()
	set appField(field: string) {
		this.cropperField = field;
	}

	// prettier-ignore
	@Output() submitted: EventEmitter<FileCreateDto> = new EventEmitter<FileCreateDto>();

	cropperField: string | undefined;
	cropperFile: File = undefined;
	cropperBase64: string = undefined;
	cropperBackgroundIsDraggable: boolean = false;

	imageTransform$: Subscription | undefined;
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

	imageForm: FormGroup | undefined;
	imageFormIsSubmitted: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private fileService: FileService
	) {
		this.imageForm = this.formBuilder.group<ImageForm>({
			url: this.formBuilder.control('', [
				this.helperService.getCustomValidator('url-image')
			]),
			name: this.formBuilder.control('', [])
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

	onSubmitFile(event: Event): void {
		if (this.helperService.getFormValidation(this.imageForm)) {
			const inputElement: HTMLInputElement = event.target as HTMLInputElement;
			const file: File = inputElement.files.item(0);

			this.cropperFile = file;

			this.imageForm.patchValue(this.cropperFile);
		}
	}

	onSubmitUrl(): void {
		if (this.helperService.getFormValidation(this.imageForm)) {
			this.imageFormIsSubmitted = true;

			const fileGetOneDto: FileGetOneDto = {
				...this.imageForm.value
			};

			this.fileService.getOne(fileGetOneDto).subscribe({
				next: (file: File) => {
					this.cropperFile = file;

					this.imageFormIsSubmitted = false;
				},
				error: () => (this.imageFormIsSubmitted = false)
			});
		}
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
			rotate: direction
				? this.imageTransform.rotate + 15
				: this.imageTransform.rotate - 15
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
	}

	// prettier-ignore
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

		formData.append(this.cropperField, file);

		this.fileService.create(formData).subscribe({
			next: (fileCreateDto: FileCreateDto) => {
				this.submitted.emit(fileCreateDto);

				this.onClose();
			},
			error: (error: any) => console.error(error)
		});
	}
}
