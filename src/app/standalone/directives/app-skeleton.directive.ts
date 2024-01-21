/** @format */

import { AfterViewInit, Directive, ElementRef, inject, Input, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HelperService } from '../../core/services/helper.service';

@Directive({
	standalone: true,
	selector: '[appSkeleton]'
})
export class SkeletonDirective implements AfterViewInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly elementRef: ElementRef = inject(ElementRef);
	private readonly helperService: HelperService = inject(HelperService);

	@Input({ required: true })
	set appSkeletonToggle(loading: boolean) {
		this.skeletonToggleSubject$.next(loading);
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

	skeletonToggleSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	skeletonToggle$: Subscription | undefined;

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

	ngAfterViewInit(): void {
		this.skeletonToggle$ = this.skeletonToggleSubject$.subscribe({
			next: (skeletonToggle: boolean) => this.setSkeleton(skeletonToggle),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.skeletonToggle$].forEach(($: Subscription) => $?.unsubscribe());
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
	setSkeleton(skeletonToggle: boolean): void {
		if (skeletonToggle) {
			this.elementRef.nativeElement.classList.add(...this.skeletonClassListElementRef, 'relative');
			this.elementRef.nativeElement.appendChild(this.getSkeleton());
		} else {
			this.elementRef.nativeElement.classList.remove(...this.skeletonClassListElementRef);
			this.elementRef.nativeElement.querySelectorAll('[id^="skeleton"]').forEach((spanElement: HTMLSpanElement) => spanElement.remove());
		}
	}
}
