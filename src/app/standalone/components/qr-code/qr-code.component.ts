/** @format */

import { AfterViewInit, Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WindowComponent } from '../window/window.component';
import { PlatformService } from '../../../core/services/platform.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AppearanceService } from '../../../core/services/appearance.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { HelperService } from '../../../core/services/helper.service';
import { filter, map, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { CopyToClipboardDirective } from '../../directives/app-copy-to-clipboard.directive';
import { SharpService } from '../../../core/services/sharp.service';
import { toCanvas, toDataURL } from 'qrcode';
import type { QRCodeRenderersOptions } from 'qrcode';

interface QRCodeForm {
	url: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [WindowComponent, FormsModule, ReactiveFormsModule, SvgIconComponent, CopyToClipboardDirective],
	providers: [SharpService],
	selector: 'app-qr-code, [appQRCode]',
	templateUrl: './qr-code.component.html'
})
export class QRCodeComponent implements OnInit, AfterViewInit, OnDestroy {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly location: Location = inject(Location);
	private readonly sharpService: SharpService = inject(SharpService);

	@ViewChild('QRCodeDialog') QRCodeDialog: ElementRef<HTMLDialogElement> | undefined;
	@ViewChild('QRCodeCanvas') QRCodeCanvas: ElementRef<HTMLCanvasElement> | undefined;

	@Input({ required: true })
	set appQRCodeData(QRCodeData: string) {
		this.QRCodeDataSubject$.next(QRCodeData);
	}

	QRCodeDataSubject$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	QRCodeData$: Subscription | undefined;
	QRCodeForm: FormGroup = this.formBuilder.group<QRCodeForm>({
		url: this.formBuilder.nonNullable.control('', [])
	});

	QRCodeOptionsColorScheme$: Subscription | undefined;
	QRCodeOptions: QRCodeRenderersOptions = {
		margin: 2,
		scale: 1,
		width: 256,
		color: {
			dark: '#000000ff',
			light: '#ffffffff'
		}
	};

	shareData: ShareData | undefined;
	shareDataCanShare: boolean = false;

	ngOnInit(): void {
		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleQRCodeDialog(false));
		}
	}

	ngAfterViewInit(): void {
		this.QRCodeData$ = this.QRCodeDataSubject$.pipe(
			filter((value: string) => !!value && !!this.QRCodeCanvas?.nativeElement),
			map((value: string) => value.replace(/^(https?:\/\/)/, '')),
			tap((value: string) => this.setQRCodeToCanvas(value))
		).subscribe({
			next: (value: string) => {
				const abstractControl: AbstractControl | null = this.QRCodeForm.get('url');

				abstractControl.setValue(value);
				abstractControl.markAsTouched();
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.QRCodeData$, this.QRCodeOptionsColorScheme$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleQRCodeDialog(toggle: boolean): void {
		if (toggle) {
			this.QRCodeDialog.nativeElement.showModal();
		} else {
			this.QRCodeDialog.nativeElement.close();
		}
	}

	onSaveQRCode(): void {
		if (this.platformService.isBrowser()) {
			const abstractControl: AbstractControl | null = this.QRCodeForm.get('url');
			const abstractControlValue = abstractControl.value.split('/').pop();

			if (this.platformService.isMobile()) {
				toCanvas(abstractControl.value, this.QRCodeOptions, (error: Error, canvas: HTMLCanvasElement) => {
					if (error) {
						this.snackbarService.error('Error', "Can't download your QR Code");
					} else {
						canvas.toBlob((blob: Blob) => {
							const shareData: ShareData = {
								files: [this.sharpService.getFileFromBlob(blob, abstractControlValue)]
							};

							this.shareDataCanShare = this.getShareNative(shareData);
							this.shareData = this.shareDataCanShare ? shareData : undefined;

							if (this.shareData) {
								this.setShareNative();
							}
						});
					}
				});
			} else {
				toDataURL(abstractControl.value, this.QRCodeOptions, (error: Error, dataURL: string): void => {
					if (error) {
						this.snackbarService.error('Error', "Can't download your QR Code");
					} else {
						this.helperService.setDownload(dataURL, abstractControlValue);
					}
				});
			}
		}
	}

	setQRCodeOptions(): void {
		if (this.platformService.isBrowser()) {
			const QRCodeOptionsColor: Record<string, string> = {
				dark: '--bc',
				light: '--b1'
			};

			/** Prepare theme colors */

			Object.keys(QRCodeOptionsColor).forEach((key: string) => {
				QRCodeOptionsColor[key] = this.appearanceService.getCSSColor(QRCodeOptionsColor[key], 'hex');
			});

			this.QRCodeOptions.color = QRCodeOptionsColor;
		}
	}

	setQRCodeToCanvas(value: string): void {
		if (this.platformService.isBrowser()) {
			const QRCodeToCanvas = (): void => {
				this.setQRCodeOptions();

				toCanvas(this.QRCodeCanvas.nativeElement, value, this.QRCodeOptions, (error: Error): void => {
					if (error) {
						this.snackbarService.error('Error', "Can't draw your QR Code");
					} else {
						this.QRCodeCanvas.nativeElement.removeAttribute('style');
					}
				});
			};

			this.QRCodeOptionsColorScheme$?.unsubscribe();
			this.QRCodeOptionsColorScheme$ = this.appearanceService.getPrefersColorScheme().subscribe({
				next: () => QRCodeToCanvas(),
				error: (error: any) => console.error(error)
			});

			// Initial call

			QRCodeToCanvas();
		}
	}

	/** Native share */

	getShareNative(shareData: ShareData): boolean {
		if (this.platformService.isBrowser()) {
			return navigator.share && navigator.canShare(shareData);
		} else {
			return false;
		}
	}

	setShareNative(): void {
		if (this.platformService.isBrowser()) {
			navigator
				.share(this.shareData)
				.then(() => console.debug('Shared through native share'))
				.catch((error: any) => console.error(error));
		}
	}
}
