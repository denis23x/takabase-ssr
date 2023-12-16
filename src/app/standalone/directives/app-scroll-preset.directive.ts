/** @format */

import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
	standalone: true,
	selector: '[appScrollPreset]'
})
export class AppScrollPresetDirective implements OnInit, OnDestroy {
	@Input({ required: true })
	set appScrollActive(scrollActive: boolean) {
		this.scrollActive$.next(scrollActive);
	}

	scrollActive: boolean = false;
	scrollActive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	parentLi: HTMLElement | undefined;
	parentUl: HTMLElement | undefined;

	constructor(
		private elementRef: ElementRef,
		private platformService: PlatformService
	) {}

	ngOnInit(): void {
		this.scrollActive$
			.pipe(
				distinctUntilChanged(),
				tap((scrollActive: boolean) => (this.scrollActive = scrollActive))
			)
			.subscribe({
				next: () => this.setScroll(this.scrollActive),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.scrollActive$].forEach(($: BehaviorSubject<boolean>) => $?.complete());
	}

	setScroll(toggle: boolean): void {
		this.parentLi = this.elementRef.nativeElement.parentElement;
		this.parentUl = this.parentLi.parentElement;

		if (this.platformService.isBrowser()) {
			if (toggle) {
				this.setScrollX();
				this.setScrollY();
			}
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
