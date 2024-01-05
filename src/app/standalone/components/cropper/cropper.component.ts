/** @format */

import {
	AfterViewInit,
	Component,
	computed,
	ElementRef,
	EventEmitter,
	Inject,
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
import { Subscription } from 'rxjs';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { HelperService } from '../../../core/services/helper.service';
import { AppInputOnlyPasteDirective } from '../../directives/app-input-only-paste.directive';
import { AppInputTrimWhitespaceDirective } from '../../directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { WindowComponent } from '../window/window.component';
import { AppPlatformDirective } from '../../directives/app-platform.directive';
import { PlatformService } from '../../../core/services/platform.service';
import { MarkdownService } from '../../../core/services/markdown.service';
import { filter, switchMap, tap } from 'rxjs/operators';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { IPAService } from '../../../core/services/ipa.service';
import { FileService } from '../../../core/services/file.service';
import { IPAOperation } from '../../../core/dto/ipa/ipa-operation.dto';

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
	@ViewChild("cropperDialogElement") cropperDialogElement: | ElementRef<HTMLDialogElement> | undefined;

	@ViewChild('imageFormFile') imageFormFile: ElementRef<HTMLInputElement> | undefined;

	@ViewChild(ImageCropperComponent) imageCropperComponent: ImageCropperComponent | undefined;

	@Output() appCropperSubmit: EventEmitter<File> = new EventEmitter<File>();
	@Output() appCropperToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	imageForm: FormGroup | undefined;
	imageFormRequest$: Subscription | undefined;
	imageFormMime: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
	imageFormMimeComputed: Signal<string> = computed(() => {
		const imageFormMime: string[] = this.imageFormMime.map((mime: string) => {
			return mime.replace('image/', '*.');
		});

		return imageFormMime.join(', ');
	});

	markdownItClipboard$: Subscription | undefined;
	markdownItClipboardToggle: boolean = false;

	cropperImageForm: FormGroup | undefined;
	cropperImageForm$: Subscription | undefined;
	cropperImageFormToggle: boolean = false;

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
			value: 1,
			label: '1:1 (square)'
		},
		{
			value: 3 / 2,
			label: '3:2 (photography)'
		},
		{
			value: 4 / 3,
			label: '4:3 (standard screen)'
		},
		{
			value: 16 / 9,
			label: '16:9 (widescreen)'
		},
		{
			value: 9 / 16,
			label: '9:16 (mobile)'
		},
		{
			value: null,
			label: 'No aspect ratio'
		}
	];

	cropperMinWidth: number = 0;
	cropperMinHeight: number = 0;

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

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
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
		this.cropperImageForm = this.formBuilder.group<CropperImageForm>({
			scale: this.formBuilder.nonNullable.control(1, [
				Validators.required,
				Validators.min(1),
				Validators.max(5)
			]),
			rotate: this.formBuilder.nonNullable.control(0, [
				Validators.required,
				Validators.min(0),
				Validators.max(360)
			]),
			flipV: this.formBuilder.nonNullable.control(false, [Validators.required]),
			flipH: this.formBuilder.nonNullable.control(false, [Validators.required])
		});
	}

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			/** Listen clipboard from markdown-it textarea */

			this.markdownItClipboard$?.unsubscribe();
			this.markdownItClipboard$ = this.markdownService.markdownItClipboard
				.pipe(filter((clipboardEventInit: ClipboardEventInit | undefined) => !!clipboardEventInit))
				.subscribe({
					// prettier-ignore
					next: (clipboardEventInit: ClipboardEventInit) => this.onGetFileFromClipboard(clipboardEventInit, true),
					error: (error: any) => console.error(error)
				});

			/** Listen Cropper image transform changes */

			this.cropperImageTransform$?.unsubscribe();
			this.cropperImageTransform$ = this.imageCropperComponent.transformChange.subscribe({
				// prettier-ignore
				next: (cropperImageTransform: ImageTransform) => (this.cropperImageTransform = cropperImageTransform),
				error: (error: any) => console.error(error)
			});

			/** Listen imageForm changes */

			this.cropperImageForm$?.unsubscribe();
			this.cropperImageForm$ = this.cropperImageForm.valueChanges
				.pipe(filter(() => this.cropperImageForm.valid))
				.subscribe({
					next: (value: any) => this.setCropperImageTransform(value),
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		[
			this.imageFormRequest$,
			this.cropperImageForm$,
			this.cropperImageTransform$,
			this.markdownItClipboard$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	/** INPUT */

	onGetFileFromClipboard(clipboardEventInit: ClipboardEventInit, toggleCropper: boolean): void {
		const clipboardFileList: FileList = clipboardEventInit.clipboardData.files;
		const clipboardFile: File | null = this.getFile(clipboardFileList);

		if (clipboardFile) {
			this.setFile(clipboardFile);

			// Show dialog (markdown-it clipboard)

			if (toggleCropper) {
				this.cropperAspectRatioActive = null;

				this.markdownItClipboardToggle = true;

				this.onToggleCropper(true);
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

	onGetFileFromInternet(event: Event): void {
		const inputEvent: InputEvent = event as InputEvent;
		const inputEventUrl: string = inputEvent.data;

		if (this.helperService.getFormValidation(this.imageForm) && inputEventUrl) {
			this.imageForm.disable();

			this.imageFormRequest$?.unsubscribe();
			this.imageFormRequest$ = this.ipaService.getOneViaProxy(inputEventUrl).subscribe({
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

					const cropperMinWidth: number = width * 0.25;
					const cropperMinHeight: number = height * 0.25;

					this.cropperMinWidth = cropperMinWidth >= 128 ? cropperMinWidth : 128;
					this.cropperMinHeight = cropperMinHeight >= 128 ? cropperMinHeight : 128;

					if (width < requiredSize || height < requiredSize) {
						const canvasElement: HTMLCanvasElement = this.document.createElement('canvas');
						const canvasElementContext: CanvasRenderingContext2D = canvasElement.getContext('2d');

						canvasElement.width = width < requiredSize ? requiredSize : width;
						canvasElement.height = height < requiredSize ? requiredSize : height;

						const dx: number = Math.floor((canvasElement.width - width) / 2);
						const dy: number = Math.floor((canvasElement.height - height) / 2);

						canvasElementContext.drawImage(event.target, dx, dy, width, height);

						// prettier-ignore
						canvasElement.toBlob((blob: Blob) => resolve(this.fileService.getFileFromBlob(blob)), requiredType, 1);
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

	onCropperReset(): void {
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

		this.cropperAspectRatioActive = this.markdownItClipboardToggle ? null : 1;

		/** Reset Forms */

		// prettier-ignore
		[this.imageForm, this.cropperImageForm].forEach((formGroup: FormGroup) => formGroup.reset({}, { emitEvent: false }));
	}

	setCropperImageTransform(cropperImageTransform: Partial<ImageTransform>): void {
		this.cropperImageTransform = {
			...this.cropperImageTransform,
			...cropperImageTransform
		};
	}

	/** EVENTS */

	onResetCropper(): void {
		/** Transformations reset */

		this.onCropperReset();

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
		this.cropperImageFormToggle = false;
	}

	onToggleCropper(toggle: boolean): void {
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

	onSubmitCropper(): void {
		const file: File = this.fileService.getFileFromBlob(this.cropperBlob);

		this.cropperImageForm.disable();

		this.imageFormRequest$?.unsubscribe();
		this.imageFormRequest$ = this.ipaService
			.create(file)
			.pipe(
				switchMap((fileUrl: string) => {
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

					return this.ipaService.getOneViaGCS(ipaOperationParams);
				}),
				tap(() => this.onToggleCropper(false))
			)
			.subscribe({
				next: (file: File) => {
					if (this.markdownItClipboardToggle) {
						this.markdownService.markdownItClipboardFileImage.next(file);

						this.markdownItClipboardToggle = false;
					} else {
						this.appCropperSubmit.emit(file);
					}
				},
				error: () => this.cropperImageForm.enable()
			});
	}
}
