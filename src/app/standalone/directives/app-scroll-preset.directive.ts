/** @format */

import { AfterViewInit, Directive, ElementRef, inject, Input, OnDestroy } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';
import { distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Directive({
	standalone: true,
	selector: '[appScrollPreset]'
})
export class ScrollPresetDirective implements AfterViewInit, OnDestroy {
	private readonly elementRef: ElementRef = inject(ElementRef);
	private readonly platformService: PlatformService = inject(PlatformService);

	@Input({ required: true })
	set appScrollActive(scrollActive: boolean) {
		this.scrollActiveSubject$.next(scrollActive);
	}

	scrollActiveSubject$: Subject<boolean> = new Subject<boolean>();
	scrollActive$: Subscription | undefined;

	parentLi: HTMLElement | undefined;
	parentUl: HTMLElement | undefined;

	ngAfterViewInit(): void {
		this.scrollActive$ = this.scrollActiveSubject$.pipe(distinctUntilChanged()).subscribe({
			next: (scrollActive: boolean) => this.setScroll(scrollActive),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.scrollActive$].forEach(($: Subscription) => $?.unsubscribe());
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
		const parentLiDOMRect: DOMRect = this.parentLi.getBoundingClientRect();
		const parentUlDOMRect: DOMRect = this.parentUl.getBoundingClientRect();

		const a: number = parentUlDOMRect.width / 2;
		const b: number = parentLiDOMRect.width / 2;

		this.parentUl.scrollLeft = this.parentLi.offsetLeft - (a - b);
	}

	setScrollY(): void {
		const parentLiDOMRect: DOMRect = this.parentLi.getBoundingClientRect();
		const parentUlDOMRect: DOMRect = this.parentUl.getBoundingClientRect();

		const a: number = parentUlDOMRect.height / 2;
		const b: number = parentLiDOMRect.height / 2;

		this.parentUl.scrollTop = this.parentLi.offsetTop - (a - b);
	}
}
