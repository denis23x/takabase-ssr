/** @format */

import { AfterViewInit, Directive, ElementRef, Inject, Input, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HelperService } from '../../core/services/helper.service';

@Directive({
	standalone: true,
	selector: '[appSkeleton]'
})
export class AppSkeletonDirective implements AfterViewInit, OnDestroy {
	@Input()
	set appSkeletonToggle(loading: boolean) {
		this.skeletonToggle$.next(loading);
	}

	@Input()
	set appSkeletonClassListElementRef(classList: string[]) {
		this.skeletonClassListElementRef = this.skeletonClassListElementRef.concat(classList);
	}

	@Input()
	set appSkeletonClassListParent(classList: string[]) {
		this.skeletonClassListParent = this.skeletonClassListParent.concat(classList);
	}

	@Input()
	set appSkeletonClassList(classList: string[]) {
		this.skeletonClassList = this.skeletonClassList.concat(classList);
	}

	skeletonToggle: boolean = false;
	skeletonToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	skeletonClassListElementRef: string[] = ['pointer-events-none'];
	skeletonClassListParent: string[] = ['bg-base-100', 'absolute', 'inset-0', 'w-full', 'h-full'];
	skeletonClassList: string[] = [
		'bg-base-300',
		'absolute',
		'inset-0',
		'w-full',
		'h-full',
		'animate-pulse',
		'rounded-btn'
	];

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private elementRef: ElementRef,
		private helperService: HelperService
	) {}

	ngAfterViewInit(): void {
		this.skeletonToggle$
			.pipe(tap((skeletonToggle: boolean) => (this.skeletonToggle = skeletonToggle)))
			.subscribe({
				next: () => this.setSkeleton(),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.skeletonToggle$].forEach(($: BehaviorSubject<boolean>) => $?.complete());
	}

	getSkeleton(): any {
		const uuid: string = this.helperService.getUUID();

		const spanElementSkeleton: HTMLSpanElement = this.document.createElement('span');

		spanElementSkeleton.id = ['skeleton', uuid].join('-');
		spanElementSkeleton.classList.add(...this.skeletonClassList);

		const spanElementParent: HTMLSpanElement = this.document.createElement('span');

		spanElementParent.id = ['skeleton-parent', uuid].join('-');
		spanElementParent.classList.add(...this.skeletonClassListParent);
		spanElementParent.appendChild(spanElementSkeleton);

		return spanElementParent;
	}

	// prettier-ignore
	setSkeleton(): void {
		if (this.skeletonToggle) {
			this.elementRef.nativeElement.classList.add(...this.skeletonClassListElementRef, 'relative');
			this.elementRef.nativeElement.appendChild(this.getSkeleton());
		} else {
			this.elementRef.nativeElement.classList.remove(...this.skeletonClassListElementRef);
			this.elementRef.nativeElement.querySelectorAll('[id^="skeleton"]').forEach((spanElement: HTMLSpanElement) => spanElement.remove());
		}
	}
}
