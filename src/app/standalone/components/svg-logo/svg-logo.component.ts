/** @format */

import { Component, Input } from '@angular/core';

@Component({
	standalone: true,
	selector: 'app-svg-logo, [appSvgLogo]',
	templateUrl: './svg-logo.component.html'
})
export class SvgLogoComponent {
	@Input({ required: true })
	set appSvgLogoViewBox(viewBox: string) {
		this.viewBox = viewBox;
	}

	@Input({ required: true })
	set appSvgLogoWidth(width: string) {
		this.width = width;
	}

	@Input({ required: true })
	set appSvgLogoHeight(height: string) {
		this.height = height;
	}

	@Input({ required: true })
	set appSvgLogoIcon(icon: string) {
		this.icon = '#' + icon;
	}

	viewBox: string = '0 0 0 0';

	width: string = '0';
	height: string = '0';

	icon: string | undefined;
}
