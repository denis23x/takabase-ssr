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
import type { QRCodeRenderersOptions } from 'qrcode';
import QRCode from 'qrcode';
import { CopyToClipboardDirective } from '../../directives/app-copy-to-clipboard.directive';

interface QRCodeForm {
	url: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [WindowComponent, FormsModule, ReactiveFormsModule, SvgIconComponent, CopyToClipboardDirective],
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

	onDownloadQRCode(): void {
		if (this.platformService.isBrowser()) {
			const abstractControl: AbstractControl | null = this.QRCodeForm.get('url');

			QRCode.toDataURL(abstractControl.value, this.QRCodeOptions, (error: Error, dataURL: string): void => {
				if (error) {
					this.snackbarService.error('Error', "Can't download your QR Code");
				} else {
					this.helperService.setDownload(dataURL, abstractControl.value.split('/').pop());
				}
			});
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

				QRCode.toCanvas(this.QRCodeCanvas.nativeElement, value, this.QRCodeOptions, (error: Error): void => {
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
}
