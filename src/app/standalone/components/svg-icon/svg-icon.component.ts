/** @format */

import { Component, Input } from '@angular/core';

@Component({
	standalone: true,
	selector: 'app-svg-icon, [appSvgIcon]',
	templateUrl: './svg-icon.component.html'
})
export class SvgIconComponent {
	@Input()
	set appSvgIconSquare(square: string) {
		this.square = square;
	}

	@Input()
	set appSvgIconViewBox(viewBox: string) {
		this.viewBox = viewBox;
	}

	@Input()
	set appSvgIconWidth(width: string) {
		this.width = width;
	}

	@Input()
	set appSvgIconHeight(height: string) {
		this.height = height;
	}

	@Input()
	set appSvgIconIcon(icon: string) {
		this.icon = icon;
	}

	square: string | undefined;
	viewBox: string = '0 0 16 16';

	width: string = '1em';
	height: string = '1em';

	icon: string | undefined;
}
