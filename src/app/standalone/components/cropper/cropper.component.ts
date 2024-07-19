/** @format */

import {
	AfterViewInit,
	Component,
	computed,
	ElementRef,
	EventEmitter,
	inject,
	OnDestroy,
	Output,
	Signal,
	ViewChild
} from '@angular/core';
import { Dimensions, ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { CropperPosition } from 'ngx-image-cropper/lib/interfaces/cropper-position.interface';
import { Subscription, merge } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { HelperService } from '../../../core/services/helper.service';
import { InputOnlyPasteDirective } from '../../directives/app-input-only-paste.directive';
import { InputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { WindowComponent } from '../window/window.component';
import { PlatformDirective } from '../../directives/app-platform.directive';
import { PlatformService } from '../../../core/services/platform.service';
import { filter, switchMap, tap } from 'rxjs/operators';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SharpService } from '../../../core/services/sharp.service';
import { SkeletonDirective } from '../../directives/app-skeleton.directive';
import { BadgeErrorComponent } from '../badge-error/badge-error.component';
import { AIService } from '../../../core/services/ai.service';
import { BusService } from '../../../core/services/bus.service';
import type { SharpFetchDto } from '../../../core/dto/sharp/sharp-fetch.dto';
import type { ImageTransform } from 'ngx-image-cropper/lib/interfaces/image-transform.interface';

interface ImageForm {
	url: FormControl<string>;
}

interface CropperImageForm {
	rotate: FormControl<number>;
	scale: FormControl<number>;
	flipV: FormControl<boolean>;
	flipH: FormControl<boolean>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		SvgIconComponent,
		InputOnlyPasteDirective,
		InputTrimWhitespaceDirective,
		WindowComponent,
		PlatformDirective,
		DropdownComponent,
		SkeletonDirective,
		BadgeErrorComponent,
		ImageCropperComponent
	],
	providers: [AIService, SharpService],
	selector: 'app-cropper, [appCropper]',
	templateUrl: './cropper.component.html'
})
export class CropperComponent implements AfterViewInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly sharpService: SharpService = inject(SharpService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly aiService: AIService = inject(AIService);
	private readonly busService: BusService = inject(BusService);

	@ViewChild('cropperDialogElement') cropperDialogElement: ElementRef<HTMLDialogElement> | undefined;
	@ViewChild('imageFormFile') imageFormFile: ElementRef<HTMLInputElement> | undefined;
	@ViewChild(ImageCropperComponent) imageCropperComponent: ImageCropperComponent | undefined;

	@Output() appCropperSubmit: EventEmitter<File> = new EventEmitter<File>();
	@Output() appCropperToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	imageForm: FormGroup = this.formBuilder.group<ImageForm>({
		url: this.formBuilder.nonNullable.control('', [Validators.pattern(this.helperService.getRegex('url'))])
	});
	imageFormRequest$: Subscription | undefined;
	imageFormMime: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	imageFormMimeComputed: Signal<string> = computed(() => {
		const imageFormMime: string[] = this.imageFormMime.map((mime: string) => {
			return mime.replace('image/', '*.');
		});

		return imageFormMime.join(', ');
	});

	markdownItToggle: boolean = false;
	markdownItToggle$: Subscription | undefined;

	cropperImageForm: FormGroup = this.formBuilder.group<CropperImageForm>({
		scale: this.formBuilder.nonNullable.control(1, [Validators.required, Validators.min(1), Validators.max(5)]),
		rotate: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0), Validators.max(360)]),
		flipV: this.formBuilder.nonNullable.control(false, [Validators.required]),
		flipH: this.formBuilder.nonNullable.control(false, [Validators.required])
	});
	cropperImageForm$: Subscription | undefined;

	cropperImageTransform$: Subscription | undefined;
	cropperImageTransform: ImageTransform = {
		translateUnit: 'px',
		scale: 1,
		rotate: 0,
		flipH: false,
		flipV: false,
		translateH: 0,
		translateV: 0
	};

	cropperAspectRatioActive: number = 1;
	cropperAspectRatioList: any[] = [
		{
			id: 1,
			value: 1,
			label: '1:1 (square)'
		},
		{
			id: 2,
			value: 3 / 2,
			label: '3:2 (photography)'
		},
		{
			id: 3,
			value: 4 / 3,
			label: '4:3 (standard screen)'
		},
		{
			id: 4,
			value: 16 / 9,
			label: '16:9 (widescreen)'
		},
		{
			id: 5,
			value: 9 / 16,
			label: '9:16 (mobile)'
		},
		{
			id: 6,
			value: null,
			label: 'No aspect ratio'
		}
	];

	cropperMinWidth: number = 0;
	cropperMinHeight: number = 0;

	cropperResizeToWidth: number = 256;
	cropperResizeToHeight: number = 256;

	cropperFile: File = undefined;
	cropperBlob: Blob = undefined;
	cropperMoveImage: boolean = false;
	cropperDialogToggle: boolean = false;
	cropperIsReady: boolean = false;
	cropperDimensions: Dimensions = {
		width: 0,
		height: 0
	};
	cropperPosition: CropperPosition = {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0
	};

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			/** Listen markdown-it */

			this.markdownItToggle$?.unsubscribe();
			this.markdownItToggle$ = merge(
				this.busService.markdownItCropperToggle.pipe(filter((toggle: boolean) => toggle)),
				this.busService.markdownItTriggerClipboard.pipe(
					tap((clipboardEvent: ClipboardEventInit) => this.onGetFileFromClipboard(clipboardEvent))
				)
			).subscribe({
				next: () => this.onToggleCropperDialog(true, true),
				error: (error: any) => console.error(error)
			});

			/** Listen Cropper image transform changes */

			this.cropperImageTransform$?.unsubscribe();
			this.cropperImageTransform$ = this.imageCropperComponent.transformChange.subscribe({
				next: (cropperImageTransform: ImageTransform) => (this.cropperImageTransform = cropperImageTransform),
				error: (error: any) => console.error(error)
			});

			/** Listen imageForm changes */

			this.cropperImageForm$?.unsubscribe();
			this.cropperImageForm$ = this.cropperImageForm.valueChanges
				.pipe(filter(() => this.cropperImageForm.valid))
				.subscribe({
					next: (value: any) => {
						this.cropperImageTransform = {
							...this.cropperImageTransform,
							...value
						};
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.imageFormRequest$, this.cropperImageForm$, this.cropperImageTransform$, this.markdownItToggle$].forEach(($: Subscription) => $?.unsubscribe());
	}

	/** INPUT */

	onGetFileFromClipboard(clipboardEventInit: ClipboardEventInit): void {
		const clipboardFileList: FileList = clipboardEventInit.clipboardData.files;
		const clipboardFile: File | null = this.getFile(clipboardFileList);

		if (clipboardFile) {
			this.setFile(clipboardFile);
		} else {
			const clipboardUrl: string = clipboardEventInit.clipboardData.getData('text/plain');

			if (clipboardUrl) {
				this.onGetFileFromInternet(clipboardUrl);
			}
		}
	}

	onGetFileFromDevice(event: Event): void {
		const inputElement: HTMLInputElement = event.target as HTMLInputElement;
		const inputElementFileList: FileList = inputElement.files;
		const inputElementFile: File | null = this.getFile(inputElementFileList);

		if (inputElementFile) {
			this.setFile(inputElementFile);
		}
	}

	onGetFileFromInternet(url: string): void {
		if (this.helperService.getFormValidation(this.imageForm)) {
			this.imageForm.disable();

			const sharpFetchDto: SharpFetchDto = {
				url
			};

			this.imageFormRequest$?.unsubscribe();
			this.imageFormRequest$ = this.sharpService.getFetch(sharpFetchDto).subscribe({
				next: (file: File) => this.setFile(file),
				error: () => this.imageForm.enable()
			});
		}
	}

	getFile(fileList: FileList): File | null {
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

	getFileAcceptable(file: File): Promise<File> {
		const requiredSize: number = 512;
		const requiredType: string = 'image/png';

		return new Promise((resolve, reject): void => {
			const fileReader: FileReader = new FileReader();

			fileReader.onerror = (progressEvent: ProgressEvent<FileReader>) => reject(progressEvent);
			fileReader.onload = (progressEvent: ProgressEvent<FileReader>) => {
				const imageElement: HTMLImageElement = new Image();

				imageElement.onerror = (event: string | Event) => reject(event);
				imageElement.onload = (event: any): void => {
					const width: number = event.target.width;
					const height: number = event.target.height;

					const cropperMinWidth: number = width * 0.33;
					const cropperMinHeight: number = height * 0.33;

					/** Update Cropper settings */

					this.cropperMinWidth = cropperMinWidth >= 256 ? cropperMinWidth : 256;
					this.cropperMinHeight = cropperMinHeight >= 256 ? cropperMinHeight : 256;

					if (this.markdownItToggle) {
						this.cropperResizeToWidth = 1024;
						this.cropperResizeToHeight = 1024;
					} else {
						this.cropperResizeToWidth = 512;
						this.cropperResizeToHeight = 512;
					}

					/** Return acceptable file */

					if (width < requiredSize || height < requiredSize) {
						const canvasElement: HTMLCanvasElement = this.document.createElement('canvas');
						const canvasElementContext: CanvasRenderingContext2D = canvasElement.getContext('2d');

						canvasElement.width = width < requiredSize ? requiredSize : width;
						canvasElement.height = height < requiredSize ? requiredSize : height;

						const dx: number = Math.floor((canvasElement.width - width) / 2);
						const dy: number = Math.floor((canvasElement.height - height) / 2);

						canvasElementContext.drawImage(event.target, dx, dy, width, height);

						// prettier-ignore
						canvasElement.toBlob((blob: Blob) => resolve(this.sharpService.getFileFromBlob(blob)), requiredType, 1);
					} else {
						resolve(file);
					}
				};

				imageElement.src = String(progressEvent.target.result);
			};

			fileReader.readAsDataURL(file);
		});
	}

	getFileValidation(file: File): boolean {
		if (this.sharpService.getFileValidationMime(file, this.imageFormMime)) {
			if (this.sharpService.getFileValidationSize(file, 5)) {
				return true;
			} else {
				this.snackbarService.error('Sorry', 'This file is too large to be uploaded');
			}
		} else {
			this.snackbarService.error('Error', 'Invalid image type');
		}

		return false;
	}

	setFile(file: File): void {
		if (this.getFileValidation(file)) {
			this.imageForm.disable();

			this.getFileAcceptable(file)
				.then((fileAcceptable: File) => (this.cropperFile = fileAcceptable))
				.then(() => this.imageForm.enable())
				.catch(() => this.imageForm.enable());
		}
	}

	/** Cropper */

	onCropperReady(dimensions: Dimensions): void {
		this.cropperIsReady = true;
		this.cropperDimensions = dimensions;
	}

	onCropperFailed(): void {
		this.snackbarService.error('Error', 'Invalid image type');
	}

	onCropperCropped(imageCroppedEvent: ImageCroppedEvent): void {
		this.cropperBlob = imageCroppedEvent.blob;
	}

	onCropperTransformReset(): void {
		this.cropperImageTransform = {
			translateUnit: 'px',
			scale: 1,
			rotate: 0,
			flipH: false,
			flipV: false,
			translateH: 0,
			translateV: 0
		};

		this.cropperPosition = {
			x1: 0,
			y1: 0,
			x2: this.cropperDimensions.width,
			y2: this.cropperDimensions.height
		};

		this.cropperMoveImage = false;

		this.cropperAspectRatioActive = this.markdownItToggle ? null : 1;

		/** Reset Forms */

		// prettier-ignore
		[this.imageForm, this.cropperImageForm].forEach((formGroup: FormGroup) => formGroup.reset({}, { emitEvent: false }));
	}

	/** EVENTS */

	onToggleCropperDialog(toggle: boolean, markdownItToggle: boolean = false): void {
		this.markdownItToggle = markdownItToggle;

		this.cropperAspectRatioActive = this.markdownItToggle ? null : 1;
		this.cropperDialogToggle = toggle;

		if (toggle) {
			this.cropperDialogElement.nativeElement.showModal();
		} else {
			this.cropperDialogElement.nativeElement.close();

			/** Full reset */

			this.onResetCropper();
		}

		this.appCropperToggle.emit(toggle);
	}

	onResetCropper(): void {
		/** Transformations reset */

		this.onCropperTransformReset();

		/** ngx-image-cropper reset */

		this.cropperFile = undefined;
		this.cropperBlob = undefined;
		this.cropperIsReady = false;

		/** imageForm && cropperImageForm reset */

		this.imageForm.reset();
		this.imageForm.enable();
		this.imageFormFile.nativeElement.value = '';

		this.cropperImageForm.reset();
		this.cropperImageForm.enable();
	}

	onSubmitCropper(): void {
		this.cropperImageForm.disable();

		/** Get ready file */

		const fileCropped: File = this.sharpService.getFileFromBlob(this.cropperBlob);

		/** Moderate and make .webp image */

		const formDataModeration: FormData = new FormData();

		formDataModeration.append('model', 'gantman-mobilenet-v2');
		formDataModeration.append('input', fileCropped);

		this.imageFormRequest$?.unsubscribe();
		this.imageFormRequest$ = this.aiService
			.moderateImage(formDataModeration)
			.pipe(
				switchMap(() => {
					const formDataOutput: FormData = new FormData();

					formDataOutput.append('quality', '80');
					formDataOutput.append('lossless', 'false');
					formDataOutput.append('input', fileCropped);

					return this.sharpService.getOutputWebP(formDataOutput);
				}),
				tap((file: File) => {
					if (this.markdownItToggle) {
						this.busService.markdownItCropperImage.next(file);
					} else {
						this.appCropperSubmit.emit(file);
					}
				})
			)
			.subscribe({
				next: () => this.onToggleCropperDialog(false),
				error: () => this.cropperImageForm.enable()
			});
	}
}
