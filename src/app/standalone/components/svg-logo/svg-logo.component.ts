/** @format */

import { Component, Input } from '@angular/core';

@Component({
	standalone: true,
	selector: 'app-svg-logo, [appSvgLogo]',
	templateUrl: './svg-logo.component.html'
})
export class SvgLogoComponent {
	@Input()
	set appSvgLogoSquare(square: string) {
		this.square = square;
	}

	@Input()
	set appSvgLogoViewBox(viewBox: string) {
		this.viewBox = viewBox;
	}

	@Input()
	set appSvgLogoWidth(width: string) {
		this.width = width;
	}

	@Input()
	set appSvgLogoHeight(height: string) {
		this.height = height;
	}

	@Input({ required: true })
	set appSvgLogoIcon(icon: string) {
		this.icon = '#' + icon;
	}

	square: string | undefined;
	viewBox: string = '0 0 256 256';

	width: string = '48';
	height: string = '48';

	icon: string | undefined;
}
