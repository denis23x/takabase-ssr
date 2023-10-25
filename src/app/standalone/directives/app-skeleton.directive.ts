/** @format */

import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
	standalone: true,
	selector: '[appSkeleton]'
})
export class AppSkeletonDirective implements OnInit, OnDestroy {
	@Input()
	set appSkeletonToggle(loading: boolean) {
		this.skeletonToggle$.next(loading);
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
		private elementRef: ElementRef
	) {}

	ngOnInit(): void {
		this.skeletonToggle$
			.pipe(
				distinctUntilChanged(),
				tap((skeletonToggle: boolean) => (this.skeletonToggle = skeletonToggle))
			)
			.subscribe({
				next: () => this.setSkeleton(),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.skeletonToggle$].forEach(($: BehaviorSubject<boolean>) => $?.complete());
	}

	getSkeleton(): any {
		const spanElementSkeleton: HTMLSpanElement = this.document.createElement('span');

		spanElementSkeleton.classList.add(...this.skeletonClassList);

		/** Angular Universal issue */

		if (typeof spanElementSkeleton.dataset !== 'undefined') {
			spanElementSkeleton.dataset.skeleton = '';
		}

		const spanElementParent: HTMLSpanElement = this.document.createElement('span');

		spanElementParent.classList.add(...this.skeletonClassListParent);

		/** Angular Universal issue */

		if (typeof spanElementParent.dataset !== 'undefined') {
			spanElementParent.dataset.skeletonParent = '';
		}

		spanElementParent.appendChild(spanElementSkeleton);

		return spanElementParent;
	}

	setSkeleton(): void {
		if (this.skeletonToggle) {
			this.elementRef.nativeElement.classList.add(...this.skeletonClassListElementRef, 'relative');
			this.elementRef.nativeElement.appendChild(this.getSkeleton());
		} else {
			this.elementRef.nativeElement.classList.remove(...this.skeletonClassListElementRef);
			this.elementRef.nativeElement.querySelector('[data-skeleton-parent]')?.remove();
		}
	}
}
