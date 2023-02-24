/** @format */

import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
	standalone: true,
	selector: '[appScrollIntoView]'
})
export class AppScrollIntoViewDirective implements OnInit, OnDestroy {
	@Input()
	set appActive(active: boolean) {
		this.active = active;
	}

	active: boolean = false;

	constructor(private elementRef: ElementRef) {}

	ngOnInit(): void {
		setTimeout(() => {
			if (this.active) {
				this.elementRef.nativeElement.scrollIntoView({
					behavior: 'auto',
					inline: 'center',
					block: 'center'
				});
			}
		});
	}

	ngOnDestroy(): void {}
}
