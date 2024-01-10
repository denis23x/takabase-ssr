/** @format */

import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	inject,
	Input,
	OnDestroy,
	ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowComponent } from '../window/window.component';
import { PlatformService } from '../../../core/services/platform.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AppearanceService } from '../../../core/services/appearance.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { HelperService } from '../../../core/services/helper.service';
import { filter, map } from 'rxjs/operators';
import QRCode, { QRCodeRenderersOptions } from 'qrcode';

@Component({
	standalone: true,
	imports: [CommonModule, WindowComponent],
	selector: 'app-qr-code, [appQRCode]',
	templateUrl: './qr-code.component.html'
})
export class QrCodeComponent implements AfterViewInit, OnDestroy {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	@ViewChild('QRCodeDialog') QRCodeDialog: ElementRef<HTMLDialogElement> | undefined;
	@ViewChild('QRCodeCanvas') QRCodeCanvas: ElementRef<HTMLCanvasElement> | undefined;

	@Input({ required: true })
	set appQRCodeData(QRCodeData: string) {
		this.QRCodeData$.next(QRCodeData);
	}

	@Input()
	set appQRCodeOrigin(QRCodeOrigin: boolean) {
		this.QRCodeOrigin = QRCodeOrigin;
	}

	QRCodeData$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	QRCodeOrigin: boolean = true;

	QRCodeValue: string | undefined;
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

	ngAfterViewInit(): void {
		this.QRCodeData$.pipe(
			filter((value: string) => !!value && !!this.QRCodeCanvas?.nativeElement),
			map((value: string) => {
				if (this.platformService.isBrowser()) {
					const window: Window = this.platformService.getWindow();

					if (this.QRCodeOrigin) {
						value = [window.location.origin, value].join('/');
					}
				}

				return value;
			})
		).subscribe({
			next: (value: string) => {
				this.QRCodeValue = value;

				// ExpressionChangedAfterItHasBeenCheckedError (QRCodeValue)

				this.changeDetectorRef.detectChanges();

				// Draw QR

				this.setQRCodeToCanvas();
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.QRCodeOptionsColorScheme$].forEach(($: Subscription) => $?.unsubscribe());

		[this.QRCodeData$].forEach(($: BehaviorSubject<string>) => $?.complete());
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
			// prettier-ignore
			QRCode.toDataURL(this.QRCodeValue, this.QRCodeOptions, (error: Error, dataURL: string): void => {
				if (error) {
					this.snackbarService.error('Error', "Can't download your QR Code");
				} else {
					this.helperService.getDownload(dataURL, this.QRCodeValue.split('/').pop());
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

			// prettier-ignore
			Object.keys(QRCodeOptionsColor).forEach((key: string) => {
        QRCodeOptionsColor[key] = this.appearanceService.getCSSColor(QRCodeOptionsColor[key], 'hex');
      });

			this.QRCodeOptions.color = QRCodeOptionsColor;
		}
	}

	setQRCodeToCanvas(): void {
		if (this.platformService.isBrowser()) {
			const QRCodeToCanvas = (): void => {
				this.setQRCodeOptions();

				// prettier-ignore
				QRCode.toCanvas(this.QRCodeCanvas.nativeElement, this.QRCodeValue, this.QRCodeOptions, (error: Error): void => {
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
