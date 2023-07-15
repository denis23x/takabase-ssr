/** @format */

import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
	standalone: true,
	selector: '[appScrollIntoView]'
})
export class AppScrollIntoViewDirective implements OnInit {
	@Input()
	set appScrollActive(scrollActive: boolean) {
		this.scrollActive = scrollActive;
	}

	scrollActive: boolean = false;

	constructor(private elementRef: ElementRef) {}

	ngOnInit(): void {
		setTimeout(() => {
			if (this.scrollActive) {
				this.elementRef.nativeElement.scrollIntoView({
					behavior: 'auto',
					inline: 'center',
					block: 'center'
				});
			}
		});
	}
}
