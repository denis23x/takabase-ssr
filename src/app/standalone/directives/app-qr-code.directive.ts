/** @format */

import {
	Directive,
	HostListener,
	Input,
	OnDestroy,
	OnInit
} from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';
import { BehaviorSubject } from 'rxjs';
import { AppearanceService } from '../../core/services/appearance.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { HelperService } from '../../core/services/helper.service';
import QRCode, { QRCodeRenderersOptions } from 'qrcode';

@Directive({
	standalone: true,
	selector: '[appQrCode]'
})
export class AppQrCodeDirective implements OnInit, OnDestroy {
	@HostListener('click', ['$event']) onClick() {
		if (this.QRCodeDownloadOnClick) {
			this.onQRCodeDownload();
		}
	}

	@Input()
	set appQRCodeDownloadOnClick(QRCodeDownloadOnClick: boolean) {
		this.QRCodeDownloadOnClick = QRCodeDownloadOnClick;
	}

	@Input()
	set appQRCodePath(QRCodePath: string) {
		this.QRCodePath$.next(QRCodePath);
	}

	@Input()
	set appQRCodeCanvas(QRCodeCanvas: HTMLCanvasElement) {
		this.QRCodeCanvas = QRCodeCanvas;
	}

	QRCodeDownloadOnClick: boolean = false;
	QRCodePath$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	QRCodeCanvas: HTMLCanvasElement | undefined;

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

	ngOnInit(): void {
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

		this.QRCodePath$.subscribe({
			next: () => this.setQRCodeToCanvas(),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		this.QRCodePath$.complete();
	}

	getQRCodeText(): string {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			return window.location.origin + this.QRCodePath$.getValue();
		} else {
			return '';
		}
	}

	// prettier-ignore
	setQRCodeToCanvas(): void {
    if (this.platformService.isBrowser()) {
      QRCode.toCanvas(this.QRCodeCanvas, this.getQRCodeText(), this.QRCodeOptions, (error: Error): void => {
        if (error) {
          this.snackbarService.danger('Error', "Can't draw your QR Code");
        } else {
          this.QRCodeCanvas.removeAttribute('style');
        }
      });
    }
	}

	// prettier-ignore
	onQRCodeDownload(): void {
		if (this.platformService.isBrowser()) {
	    QRCode.toDataURL(this.getQRCodeText(), this.QRCodeOptions, (error: Error, dataURL: string): void => {
	      if (error) {
	        this.snackbarService.danger('Error', "Can't download your QR Code");
	      } else {
	        this.helperService.getDownload(dataURL, this.getQRCodeText().split('/').pop());
	      }
	    });
	  }
	}
}
