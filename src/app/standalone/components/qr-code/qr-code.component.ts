/** @format */

import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowComponent } from '../window/window.component';
import { PlatformService } from '../../../core/services/platform.service';
import { BehaviorSubject } from 'rxjs';
import { AppearanceService } from '../../../core/services/appearance.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { HelperService } from '../../../core/services/helper.service';
import { filter } from 'rxjs/operators';
import QRCode, { QRCodeRenderersOptions } from 'qrcode';

@Component({
	standalone: true,
	imports: [CommonModule, WindowComponent],
	selector: 'app-qr-code, [appQRCode]',
	templateUrl: './qr-code.component.html'
})
export class QrCodeComponent implements AfterViewInit, OnDestroy {
	@ViewChild('QRCodeDialog') QRCodeDialog: ElementRef<HTMLDialogElement> | undefined;
	@ViewChild('QRCodeCanvas') QRCodeCanvas: ElementRef<HTMLCanvasElement> | undefined;

	@Input()
	set appQRCodeData(QRCodeData: string) {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			QRCodeData = [window.location.origin, QRCodeData].join('/');
		}

		this.QRCodeData$.next(QRCodeData);
	}

	QRCodeData$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	QRCodeOptions: QRCodeRenderersOptions = {
		margin: 2,
		scale: 1,
		width: 384,
		color: {
			dark: '#000000ff',
			light: '#ffffffff'
		}
	};

	constructor(
		private platformService: PlatformService,
		private appearanceService: AppearanceService,
		private snackbarService: SnackbarService,
		private helperService: HelperService
	) {}

	ngAfterViewInit(): void {
		/** Set QRCodeOptions options */

		if (this.platformService.isBrowser()) {
			/** Prepare theme colors */

			const variablesCSSMap: any[] = [
				{
					nameHSL: '--bc',
					nameHEX: 'dark'
				},
				{
					nameHSL: '--b1',
					nameHEX: 'light'
				}
			];

			// prettier-ignore
			variablesCSSMap.forEach((variable: any) => {
				const value: string = this.appearanceService.getCSSPropertyValue(variable.nameHSL);

				const [h, s, l]: number[] = value.split(/\s/g).map((value: string) => Number(value.replace('%', '')));
				const valueList: string[] = this.appearanceService.getHSLToHEX(h, s, l);

				const propertyValue: string = ['#', ...valueList, 'ff'].join('');
				const property: string = variable.nameHEX;

				this.QRCodeOptions.color[property] = propertyValue;
			});
		}

		/** Subscribe for regenerate QRCode */

		this.QRCodeData$.pipe(
			filter((value: string) => !!value && !!this.QRCodeCanvas?.nativeElement)
		).subscribe({
			next: () => this.setQRCodeToCanvas(),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		this.QRCodeData$.complete();
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
			QRCode.toDataURL(this.getQRCodeText(), this.QRCodeOptions, (error: Error, dataURL: string): void => {
				if (error) {
					this.snackbarService.danger('Error', "Can't download your QR Code");
				} else {
					this.helperService.getDownload(dataURL, this.getQRCodeText().split('/').pop());
				}
			});
		}
	}

	getQRCodeText(): string {
		return this.QRCodeData$.getValue();
	}

	setQRCodeToCanvas(): void {
		if (this.platformService.isBrowser()) {
			// prettier-ignore
			QRCode.toCanvas(this.QRCodeCanvas.nativeElement, this.getQRCodeText(), this.QRCodeOptions, (error: Error): void => {
				if (error) {
					this.snackbarService.danger('Error', "Can't draw your QR Code");
				} else {
					this.QRCodeCanvas.nativeElement.removeAttribute('style');
				}
			});
		}
	}
}
