/** @format */

import {
	AfterViewInit,
	Component,
	computed,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	Output,
	Signal,
	ViewChild
} from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent, ImageCropperModule } from 'ngx-image-cropper';
import { CropperPosition } from 'ngx-image-cropper/lib/interfaces/cropper-position.interface';
import { ImageTransform } from 'ngx-image-cropper/lib/interfaces/image-transform.interface';
import { Subscription } from 'rxjs';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { HelperService } from '../../../core/services/helper.service';
import { AppInputOnlyPasteDirective } from '../../directives/app-input-only-paste.directive';
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { WindowComponent } from '../window/window.component';
import { AppPlatformDirective } from '../../directives/app-platform.directive';
import { PlatformService } from '../../../core/services/platform.service';
import { MarkdownService } from '../../../core/services/markdown.service';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { IPAOperation } from '../../../core/dto/ipa/ipa-operation.dto';
import { IPAService } from '../../../core/services/ipa.service';
import { FileService } from '../../../core/services/file.service';

interface ImageForm {
	url: FormControl<string>;
}

interface IPAFormModulate {
	brightness: FormControl<number>;
	saturation: FormControl<number>;
	hue: FormControl<number>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ImageCropperModule,
		SvgIconComponent,
		AppInputOnlyPasteDirective,
		AppInputTrimWhitespaceDirective,
		WindowComponent,
		AppPlatformDirective,
		DropdownComponent
	],
	selector: 'app-cropper, [appCropper]',
	templateUrl: './cropper.component.html'
})
export class CropperComponent implements AfterViewInit, OnDestroy {
	// prettier-ignore
	@ViewChild("cropperDialogElement") cropperDialogElement: | ElementRef<HTMLDialogElement> | undefined

	@ViewChild('imageFormFile') imageFormFile: ElementRef<HTMLInputElement> | undefined;

	@ViewChild(ImageCropperComponent) imageCropperComponent: ImageCropperComponent | undefined;

	@Input({ required: true })
	set appCropperUploadPath(cropperUploadPath: string) {
		this.cropperUploadPath = cropperUploadPath;
	}

	@Input()
	set appCropperRemovePath(cropperRemovePath: string | null | undefined) {
		this.cropperRemovePath = cropperRemovePath;
	}

	@Output() appCropperSubmit: EventEmitter<string> = new EventEmitter<string>();
	@Output() appCropperToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	imageForm: FormGroup | undefined;
	imageFormRequest$: Subscription | undefined;
	imageFormMarkdownItClipboard$: Subscription | undefined;
	imageFormMime: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	imageFormMimeComputed: Signal<string[]> = computed(() => {
		return this.imageFormMime.map((mime: string) => mime.replace('image/', '*.'));
	});

	imageTransform$: Subscription | undefined;
	imageTransform: ImageTransform = {
		translateUnit: 'px',
		scale: 1,
		rotate: 0,
		flipH: false,
		flipV: false,
		translateH: 0,
		translateV: 0
	};

	cropperUploadPath: string | undefined;
	cropperRemovePath: string | undefined | null;

	cropperFile: File = undefined;
	cropperBlob: Blob = undefined;
	cropperBackgroundIsDraggable: boolean = false;
	cropperIsAvailable: boolean = false;
	cropperDialogToggle: boolean = false;

	cropperPositionInitial: CropperPosition = undefined;
	cropperPosition: CropperPosition = {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0
	};

	ipaFormModulateToggle: boolean = false;
	ipaFormModulate: FormGroup | undefined;
	ipaFormModulate$: Subscription | undefined;

	ipaOperationRequest$: Subscription | undefined;
	ipaOperationParams: IPAOperation[] = [
		{
			operation: 'output',
			format: 'webp'
		}
	];

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private fileService: FileService,
		private ipaService: IPAService,
		private platformService: PlatformService,
		private markdownService: MarkdownService,
		private snackbarService: SnackbarService
	) {
		this.imageForm = this.formBuilder.group<ImageForm>({
			url: this.formBuilder.nonNullable.control('', [
				Validators.pattern(this.helperService.getRegex('url'))
			])
		});
		this.ipaFormModulate = this.formBuilder.group<IPAFormModulate>({
			brightness: this.formBuilder.nonNullable.control(1, []),
			saturation: this.formBuilder.nonNullable.control(1, []),
			hue: this.formBuilder.nonNullable.control(0, [])
		});
	}

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			/** Listen clipboard from markdown textarea */

			this.imageFormMarkdownItClipboard$?.unsubscribe();
			this.imageFormMarkdownItClipboard$ = this.markdownService.markdownItClipboard
				.pipe(filter((clipboardEventInit: ClipboardEventInit | undefined) => !!clipboardEventInit))
				.subscribe({
					// prettier-ignore
					next: (clipboardEventInit: ClipboardEventInit) => this.onGetFileFromDeviceClipboard(clipboardEventInit, true),
					error: (error: any) => console.error(error)
				});

			/** Listen cropper transform changes */

			this.imageTransform$?.unsubscribe();
			this.imageTransform$ = this.imageCropperComponent.transformChange.subscribe({
				next: (imageTransform: ImageTransform) => (this.imageTransform = imageTransform),
				error: (error: any) => console.error(error)
			});

			/** Listen Image Processing API operations */

			this.ipaFormModulate$?.unsubscribe();
			this.ipaFormModulate$ = this.ipaFormModulate.valueChanges.pipe(debounceTime(1000)).subscribe({
				next: () => {
					this.ipaOperationParams = [
						this.ipaOperationParams[0],
						{
							operation: 'modulate',
							...this.ipaFormModulate.value
						},
						{
							operation: 'resize',
							width: 1024,
							height: 1024,
							position: 'center',
							fit: 'inside'
						},
						this.ipaOperationParams[this.ipaOperationParams.length - 1]
					];

					this.onImageIPA();
				},
				error: (error: any) => console.error(error)
			});
		}
	}

	ngOnDestroy(): void {
		[
			this.imageFormRequest$,
			this.imageTransform$,
			this.imageFormMarkdownItClipboard$,
			this.ipaOperationRequest$,
			this.ipaFormModulate$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	/** INPUT */

	// prettier-ignore
	onGetFileFromDeviceClipboard(clipboardEventInit: ClipboardEventInit, toggleCropper: boolean = false): void {
    const clipboardFileList: FileList = clipboardEventInit.clipboardData.files
    const clipboardFile: File | null = this.onGetFile(clipboardFileList)

    if (clipboardFile) {
      this.onSetFile(clipboardFile)

      // Show dialog

      if (toggleCropper) {
        this.onToggleCropper(true)
      }
    }
  }

	onGetFileFromDevice(event: Event): void {
		const inputElement: HTMLInputElement = event.target as HTMLInputElement;
		const inputElementFileList: FileList = inputElement.files;
		const inputElementFile: File | null = this.onGetFile(inputElementFileList);

		if (inputElementFile) {
			this.onSetFile(inputElementFile);
		}
	}

	onGetFileFromInternet(event: Event): void {
		const inputEvent: InputEvent = event as InputEvent;
		const inputEventUrl: string = inputEvent.data;

		if (this.helperService.getFormValidation(this.imageForm) && inputEventUrl) {
			this.imageForm.disable();

			const IPAOperationParams: IPAOperation[] = [
				{
					operation: 'input',
					type: 'url',
					url: inputEventUrl
				},
				{
					operation: 'output',
					format: 'webp'
				}
			];

			this.ipaOperationRequest$?.unsubscribe();
			this.ipaOperationRequest$ = this.ipaService.getOne(IPAOperationParams).subscribe({
				next: (file: File) => this.onSetFile(file),
				error: () => this.imageForm.enable()
			});
		}
	}

	onGetFile(fileList: FileList): File | null {
		if (fileList.length) {
			const file: File | null = fileList.item(0);

			if (file) {
				if (file.type.startsWith('image')) {
					return file;
				}
			}
		}

		return null;
	}

	onGetFileValidation(file: File): boolean {
		if (this.fileService.getFileValidationMime(file, this.imageFormMime)) {
			if (this.fileService.getFileValidationSize(file, 5)) {
				return true;
			} else {
				this.snackbarService.error('Sorry', 'This file is too large to be uploaded');
			}
		} else {
			this.snackbarService.error('Error', 'Invalid image type');
		}

		return false;
	}

	onSetFile(file: File): void {
		if (this.onGetFileValidation(file)) {
			this.imageForm.disable();

			const fileDate: number = Date.now();
			const fileUUID: string = this.helperService.getUUID();
			const filePath: string = [fileDate, fileUUID, file.name].join('-');

			this.imageFormRequest$?.unsubscribe();
			this.imageFormRequest$ = this.ipaService.create(file, filePath).subscribe({
				next: (fileUrl: string) => {
					this.ipaOperationParams.unshift({
						operation: 'resize',
						width: 1024,
						height: 1024,
						position: 'center',
						fit: 'inside'
					});

					this.ipaOperationParams.unshift({
						operation: 'input',
						type: 'gcs',
						source: fileUrl
					});

					this.onImageIPA();
				},
				error: () => this.imageForm.enable()
			});
		}
	}

	/** Image Processing API */

	onImageIPA(): void {
		this.imageForm.disable();

		this.ipaOperationRequest$?.unsubscribe();
		this.ipaOperationRequest$ = this.ipaService
			.getOne(this.ipaOperationParams)
			.pipe(tap((file: File) => this.onImageLoad(file)))
			.subscribe({
				next: () => this.imageForm.enable(),
				error: () => this.imageForm.enable()
			});
	}

	/** Cropper */

	onImageLoad(file: File): void {
		this.cropperPositionInitial = undefined;
		this.cropperFile = file;
	}

	onImageFailed(): void {
		this.snackbarService.error('Error', 'Invalid image type');

		// Complete reset

		this.onResetCropper();
	}

	onImageCropped(imageCroppedEvent: ImageCroppedEvent): void {
		this.cropperIsAvailable = true;
		this.cropperBlob = imageCroppedEvent.blob;

		if (!this.cropperPositionInitial) {
			this.cropperPositionInitial = imageCroppedEvent.cropperPosition;
		}
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

	onImageAspectRatio(): void {
		console.log('onImageAspectRatio');
	}

	onImageTransform(imageTransform: ImageTransform): void {
		this.imageTransform = {
			...imageTransform
		};
	}

	/** RESET */

	onResetCropper(): void {
		this.cropperFile = undefined;
		this.cropperBlob = undefined;

		this.cropperIsAvailable = false;

		// Extra reset

		this.onResetImageForm();
		this.onResetTransform();
	}

	onResetImageForm(): void {
		this.imageForm.reset();
	}

	onResetTransform(): void {
		this.imageTransform = {
			translateUnit: 'px',
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

	/** EVENTS */

	onToggleCropper(toggle: boolean): void {
		this.appCropperToggle.emit(toggle);

		this.cropperDialogToggle = toggle;

		if (toggle) {
			this.cropperDialogElement.nativeElement.showModal();
		} else {
			this.cropperDialogElement.nativeElement.close();
		}
	}

	onSubmitCropper(): void {
		// const fileDate: number = Date.now();
		// const fileCropped: File = new File([this.cropperBlob], this.cropperFile.name, {
		// 	type: this.cropperFile.type
		// });
		//
		// const fileName: string = fileDate + '-' + fileCropped.name;
		// const filePath: string = this.cropperUploadPath + '/' + fileName;
		//
		// this.imageForm.disable();
		//
		// this.imageFormRequest$?.unsubscribe();
		// this.imageFormRequest$ = this.fileService.create(fileCropped, filePath).subscribe({
		// 	next: (fileUrl: string) => {
		// 		this.appCropperSubmit.emit(fileUrl);
		//
		// 		this.imageForm.enable();
		//
		// 		this.onToggleCropper(false);
		//
		// 		// Remove previous image
		//
		// 		if (this.cropperRemovePath) {
		// 			this.fileService.delete(this.cropperRemovePath).subscribe({
		// 				next: () => console.debug('File removed'),
		// 				error: (error: any) => console.error(error)
		// 			});
		// 		}
		// 	},
		// 	error: () => this.imageForm.enable()
		// });
	}
}

// TODO: IPA
// BW
// {
// 	operation: 'grayscale'
// },
// UNNECESSARY
// { operation: 'affine', matrix: [1, 0.3, 0.1, 0.7] }
// { operation: 'blur', sigma: 50 }, HARD-LONG
// { operation: 'clahe', width: 3, height: 3 }, HARD-LONG
// INTERESTING
// {
// 	operation: 'convolve',
// 	width: 3,
// 	height: 3,
// 	kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1]
// },
// CAN ADD BORDERS
// {
// 	operation: 'extend',
// 	top: 42,
// 	bottom: 84,
// 	left: 16,
// 	right: 16,
// 	background: '#FFA03F'
// },
// CONTRAST
// { operation: 'gamma', gamma: 3.0, gammaOut: 2.2 },
// INTERESTING
// { operation: 'linear', a: 4, b: 8 },
// INTERESTING
// { operation: 'median', size: 30 },
// INTERESTING
// { operation: 'negate' },
// INTERESTING
// {
// 	operation: 'recomb',
// 	matrix: [
// 		[0.3588, 0.7044, 0.1368],
// 		[0.299, 0.587, 0.114],
// 		[0.2392, 0.4696, 0.0912]
// 	]
// },
// IDK
// { operation: 'sharpen', sigma: 500 },
// IDK
// { operation: 'threshold', threshold: 100 },
