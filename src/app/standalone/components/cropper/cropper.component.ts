/** @format */

import {
	AfterViewInit,
	Component,
	computed,
	ElementRef,
	EventEmitter,
	OnDestroy,
	Output,
	Signal,
	ViewChild
} from '@angular/core';
import {
	Dimensions,
	ImageCroppedEvent,
	ImageCropperComponent,
	ImageCropperModule
} from 'ngx-image-cropper';
import { CropperPosition } from 'ngx-image-cropper/lib/interfaces/cropper-position.interface';
import { ImageTransform } from 'ngx-image-cropper/lib/interfaces/image-transform.interface';
import { from, Subscription, switchMap } from 'rxjs';
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
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { IPAOperation } from '../../../core/dto/ipa/ipa-operation.dto';
import { IPAService } from '../../../core/services/ipa.service';
import { FileService } from '../../../core/services/file.service';

interface ImageForm {
	url: FormControl<string>;
}

interface ImageFormRotate {
	rotate: FormControl<number>;
}

interface ImageFormScale {
	scale: FormControl<number>;
}

interface IPAFormModulate {
	brightness: FormControl<number>;
	saturation: FormControl<number>;
	hue: FormControl<number>;
}

interface IPAFormBlur {
	sigma: FormControl<number>;
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

	@Output() appCropperSubmit: EventEmitter<File> = new EventEmitter<File>();
	@Output() appCropperToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	imageForm: FormGroup | undefined;
	imageFormRequest$: Subscription | undefined;
	imageFormMarkdownItClipboard$: Subscription | undefined;
	imageFormMime: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	imageFormMimeComputed: Signal<string> = computed(() => {
		const imageFormMime: string[] = this.imageFormMime.map((mime: string) => {
			return mime.replace('image/', '*.');
		});

		return imageFormMime.join(', ');
	});

	imageFormRotate: FormGroup | undefined;
	imageFormRotate$: Subscription | undefined;

	imageFormScale: FormGroup | undefined;
	imageFormScale$: Subscription | undefined;

	cropperImageTransform$: Subscription | undefined;
	cropperImageTransformInitial: ImageTransform = {
		translateUnit: 'px',
		scale: 1,
		rotate: 0,
		flipH: false,
		flipV: false,
		translateH: 0,
		translateV: 0
	};
	cropperImageTransform: ImageTransform = {
		translateUnit: 'px',
		scale: 1,
		rotate: 0,
		flipH: false,
		flipV: false,
		translateH: 0,
		translateV: 0
	};

	cropperAspectRatio: number = 1;
	cropperAspectRatioList: string[] = ['1:1', '4:3', '16:9'];

	cropperFormToggle: string | undefined;
	cropperFile: File = undefined;
	cropperBlob: Blob = undefined;
	cropperObjectUrl: string = undefined;
	cropperMoveImage: boolean = false;
	cropperDialogToggle: boolean = false;
	cropperIsReady: boolean = false;

	cropperPositionPrevious: CropperPosition = undefined;
	cropperPosition: CropperPosition = {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0
	};

	ipaFormModulate: FormGroup | undefined;
	ipaFormModulate$: Subscription | undefined;

	ipaFormBlur: FormGroup | undefined;
	ipaFormBlur$: Subscription | undefined;

	ipaOperationRequestIsBusy: boolean = false;
	ipaOperationRequest$: Subscription | undefined;
	ipaOperationParams: IPAOperation[] = [
		{
			operation: 'output',
			format: 'png'
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
		this.imageFormRotate = this.formBuilder.group<ImageFormRotate>({
			rotate: this.formBuilder.nonNullable.control(0, [
				Validators.required,
				Validators.min(0),
				Validators.max(360)
			])
		});
		this.imageFormScale = this.formBuilder.group<ImageFormScale>({
			scale: this.formBuilder.nonNullable.control(1, [
				Validators.required,
				Validators.min(1),
				Validators.max(5)
			])
		});
		this.ipaFormModulate = this.formBuilder.group<IPAFormModulate>({
			brightness: this.formBuilder.nonNullable.control(1, [
				Validators.required,
				Validators.min(0),
				Validators.max(5)
			]),
			saturation: this.formBuilder.nonNullable.control(1, [
				Validators.required,
				Validators.min(0),
				Validators.max(5)
			]),
			hue: this.formBuilder.nonNullable.control(0, [
				Validators.required,
				Validators.min(0),
				Validators.max(360)
			])
		});
		this.ipaFormBlur = this.formBuilder.group<IPAFormBlur>({
			sigma: this.formBuilder.nonNullable.control(0, [
				Validators.required,
				Validators.min(0),
				Validators.max(10)
			])
		});
	}

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			/** Listen clipboard from markdown-it textarea */

			this.imageFormMarkdownItClipboard$?.unsubscribe();
			this.imageFormMarkdownItClipboard$ = this.markdownService.markdownItClipboard
				.pipe(filter((clipboardEventInit: ClipboardEventInit | undefined) => !!clipboardEventInit))
				.subscribe({
					// prettier-ignore
					next: (clipboardEventInit: ClipboardEventInit) => this.onGetFileFromDeviceClipboard(clipboardEventInit, true),
					error: (error: any) => console.error(error)
				});

			/** Listen Cropper image transform changes */

			this.cropperImageTransform$?.unsubscribe();
			this.cropperImageTransform$ = this.imageCropperComponent.transformChange.subscribe({
				next: (cropperImageTransform: ImageTransform) =>
					(this.cropperImageTransform = cropperImageTransform),
				error: (error: any) => console.error(error)
			});

			/** Listen imageForm changes */

			this.imageFormRotate$?.unsubscribe();
			this.imageFormRotate$ = this.imageFormRotate.valueChanges
				.pipe(filter(() => this.imageFormRotate.valid))
				.subscribe({
					next: (value: any) => this.setCropperImageTransform(value),
					error: (error: any) => console.error(error)
				});

			this.imageFormScale$?.unsubscribe();
			this.imageFormScale$ = this.imageFormScale.valueChanges
				.pipe(filter(() => this.imageFormScale.valid))
				.subscribe({
					next: (value: any) => this.setCropperImageTransform(value),
					error: (error: any) => console.error(error)
				});

			/** Listen ipaForm changes */

			this.ipaFormModulate$?.unsubscribe();
			this.ipaFormModulate$ = this.ipaFormModulate.valueChanges
				.pipe(
					debounceTime(500),
					filter(() => this.ipaFormModulate.valid)
				)
				.subscribe({
					next: (value: any) => {
						this.setIPAOperationsParams({
							operation: 'modulate',
							...value
						});

						this.getIPAUpdate();
					},
					error: (error: any) => console.error(error)
				});

			this.ipaFormBlur$?.unsubscribe();
			this.ipaFormBlur$ = this.ipaFormBlur.valueChanges
				.pipe(
					debounceTime(500),
					filter(() => this.ipaFormBlur.valid)
				)
				.subscribe({
					next: (value: any) => {
						this.setIPAOperationsParams({
							operation: 'blur',
							sigma: value.sigma === 0 ? 0.3 : value.sigma
						});

						this.getIPAUpdate();
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		[
			this.imageFormRequest$,
			this.imageFormRotate$,
			this.imageFormScale$,
			this.cropperImageTransform$,
			this.imageFormMarkdownItClipboard$,
			this.ipaOperationRequest$,
			this.ipaFormModulate$,
			this.ipaFormBlur$
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

			this.ipaOperationRequest$?.unsubscribe();
			this.ipaOperationRequest$ = this.ipaService.getOneTempImageViaProxy(inputEventUrl).subscribe({
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
			this.ipaOperationRequestIsBusy = true;

			/** Upload Temp */

			this.imageFormRequest$?.unsubscribe();
			this.imageFormRequest$ = from(this.ipaService.setImagePngMime(file))
				.pipe(
					switchMap((fileAlpha: File) => this.ipaService.createTempImage(fileAlpha)),
					switchMap((fileSourcePath: string) => {
						this.ipaOperationParams.unshift({
							operation: 'input',
							type: 'gcs',
							source: fileSourcePath
						});

						return from(this.ipaService.setImagePngExtendOperation(file));
					})
				)
				.subscribe({
					next: (ipaOperation: IPAOperation | null) => {
						if (ipaOperation) {
							this.setIPAOperationsParams(ipaOperation);
						}

						this.imageForm.disable();
						this.ipaOperationRequestIsBusy = true;

						this.getIPAUpdate();
					},
					error: () => {
						this.imageForm.enable();
						this.ipaOperationRequestIsBusy = false;
					}
				});
		}
	}

	/** Image Processing API */

	setIPAOperationsParams(ipaOperation: IPAOperation): void {
		// prettier-ignore
		const operationIndex: number = this.ipaOperationParams.findIndex((ipaOperationExisting: IPAOperation) => {
      return ipaOperationExisting.operation === ipaOperation.operation;
    });

		if (operationIndex === -1) {
			this.ipaOperationParams.splice(this.ipaOperationParams.length - 1, 0, ipaOperation);
		} else {
			this.ipaOperationParams[operationIndex] = ipaOperation;
		}
	}

	getIPAUpdate(callback: () => any = () => console.debug('IPA Updated')): void {
		this.imageForm.disable();
		this.ipaOperationRequestIsBusy = true;

		this.ipaOperationRequest$?.unsubscribe();
		this.ipaOperationRequest$ = this.ipaService
			.getOneTempImageViaGCS(this.ipaOperationParams)
			.pipe(tap((file: File) => (this.cropperFile = file)))
			.subscribe({
				next: () => {
					this.imageForm.enable();
					this.ipaOperationRequestIsBusy = false;

					callback();
				},
				error: () => {
					this.imageForm.enable();
					this.ipaOperationRequestIsBusy = false;

					callback();
				}
			});
	}

	/** Cropper */

	onCropperReady(dimensions: Dimensions): void {
		this.cropperIsReady = true;

		// Handle cropperPosition

		if (this.cropperPositionPrevious) {
			this.cropperPosition = {
				...this.cropperPositionPrevious
			};
		} else {
			this.cropperPosition = {
				x1: 0,
				y1: 0,
				x2: dimensions.width,
				y2: dimensions.height
			};
		}
	}

	onCropperFailed(): void {
		this.snackbarService.error('Error', 'Invalid image type');
	}

	onCropperCropped(imageCroppedEvent: ImageCroppedEvent): void {
		this.cropperBlob = imageCroppedEvent.blob;

		// Always set cropper previous state (when use IPA we got new file so should restore cropperPosition)

		this.cropperPositionPrevious = imageCroppedEvent.cropperPosition;

		// Debug

		this.cropperObjectUrl = imageCroppedEvent.objectUrl;
	}

	onCropperFormToggle(cropperFormToggle: string): void {
		if (this.cropperFormToggle === cropperFormToggle) {
			this.cropperFormToggle = undefined;
		} else {
			this.cropperFormToggle = cropperFormToggle;
		}
	}

	onCropperReset(): void {
		const ipaOperationList: string[] = ['input', 'extend', 'output'];

		this.ipaOperationParams = this.ipaOperationParams.filter((ipaOperation: IPAOperation) => {
			return ipaOperationList.includes(ipaOperation.operation);
		});

		this.getIPAUpdate(() => {
			this.cropperImageTransform = {
				...this.cropperImageTransformInitial
			};

			this.cropperAspectRatio = 1;
			this.cropperFormToggle = undefined;
			this.cropperMoveImage = false;
			this.cropperPositionPrevious = undefined;

			/** Reset Forms */

			[
				this.imageForm,
				this.imageFormRotate,
				this.imageFormScale,
				this.ipaFormModulate,
				this.ipaFormBlur
			].forEach((formGroup: FormGroup) => formGroup.reset({}, { emitEvent: false }));
		});
	}

	setCropperImageFlip(direction: boolean): void {
		if (direction) {
			this.cropperImageTransform = {
				...this.cropperImageTransform,
				flipV: !this.cropperImageTransform.flipV
			};
		} else {
			this.cropperImageTransform = {
				...this.cropperImageTransform,
				flipH: !this.cropperImageTransform.flipH
			};
		}
	}

	setCropperImageAspectRatio(aspectRatio: string): void {
		const [width, height]: number[] = aspectRatio.split(':').map((side: string) => Number(side));

		this.cropperAspectRatio = width / height;
	}

	setCropperImageTransform(cropperImageTransform: Partial<ImageTransform>): void {
		this.cropperImageTransform = {
			...this.cropperImageTransform,
			...cropperImageTransform
		};
	}

	/** EVENTS */

	onResetCropper(): void {
		/** Transformations && IPA operations reset */

		this.onCropperReset();

		/** Cropper component reset */

		this.cropperFile = undefined;
		this.cropperBlob = undefined;
		this.cropperObjectUrl = undefined;
		this.cropperIsReady = false;

		this.ipaOperationRequestIsBusy = false;
		this.ipaOperationRequest$?.unsubscribe();

		/** Close Cropper dialog */

		this.onToggleCropper(false);
	}

	onToggleCropper(toggle: boolean): void {
		this.cropperDialogToggle = toggle;

		if (toggle) {
			this.cropperDialogElement.nativeElement.showModal();
		} else {
			this.cropperDialogElement.nativeElement.close();
		}

		this.appCropperToggle.emit(toggle);
	}

	onSubmitCropper(): void {
		this.ipaOperationRequestIsBusy = true;

		// prettier-ignore
		const fileAlpha: File = this.fileService.getFileFromBlob(this.cropperBlob);

		this.ipaOperationRequest$?.unsubscribe();
		this.ipaOperationRequest$ = this.ipaService
			.createTempImage(fileAlpha)
			.pipe(
				map((fileUrl: string) => {
					const ipaOperationParams: IPAOperation[] = [
						{
							operation: 'input',
							type: 'gcs',
							source: fileUrl
						},
						{
							operation: 'output',
							format: 'webp'
						}
					];

					return ipaOperationParams;
				}),
				switchMap((ipaOperationParams: IPAOperation[]) => {
					return this.ipaService.getOneTempImageViaGCS(ipaOperationParams);
				})
			)
			.subscribe({
				next: (file: File) => {
					this.onResetCropper();

					this.appCropperSubmit.emit(file);
				},
				error: () => (this.ipaOperationRequestIsBusy = false)
			});
	}
}
