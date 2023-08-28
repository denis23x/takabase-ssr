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

	parentLi: HTMLElement | undefined;
	parentUl: HTMLElement | undefined;

	constructor(private elementRef: ElementRef) {}

	ngOnInit(): void {
		setTimeout(() => this.setScroll(this.scrollActive));
	}

	setScroll(toggle: boolean): void {
		this.parentLi = this.elementRef.nativeElement.parentElement;
		this.parentUl = this.parentLi.parentElement;

		if (toggle) {
			setTimeout(() => {
				this.setScrollX();
				this.setScrollY();
			});
		}
	}

	setScrollX(): void {
		const parentLi: DOMRect = this.parentLi.getBoundingClientRect();
		const parentUl: DOMRect = this.parentUl.getBoundingClientRect();

		const a: number = parentUl.width / 2;
		const b: number = parentLi.width / 2;

		this.parentUl.scrollLeft = this.parentLi.offsetLeft - (a - b);
	}

	setScrollY(): void {
		const parentLi: DOMRect = this.parentLi.getBoundingClientRect();
		const parentUl: DOMRect = this.parentUl.getBoundingClientRect();

		const a: number = parentUl.height / 2;
		const b: number = parentLi.height / 2;

		this.parentUl.scrollTop = this.parentLi.offsetTop - (a - b);
	}
}
