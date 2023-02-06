/** @format */

import { Component, Input, OnInit } from '@angular/core';

@Component({
	standalone: true,
	selector: 'app-svg-icon, [appSvgIcon]',
	templateUrl: './svg-icon.component.html'
})
export class SvgIconComponent implements OnInit {
	@Input()
	set appSquare(square: string) {
		this.square = square;
	}

	@Input()
	set appViewBox(viewBox: string) {
		this.viewBox = viewBox;
	}

	@Input()
	set appWidth(width: string) {
		this.width = width;
	}

	@Input()
	set appHeight(height: string) {
		this.height = height;
	}

	@Input()
	set appIcon(icon: string) {
		this.icon = icon;
	}

	square: string | undefined;
	viewBox: string = '0 0 16 16';

	width: string = '1.25em';
	height: string = '1.25em';

	icon: string | undefined;

	constructor() {}

	ngOnInit(): void {}
}
