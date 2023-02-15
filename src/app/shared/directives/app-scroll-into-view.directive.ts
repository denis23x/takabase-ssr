/** @format */

import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PlatformService } from '../../core/services/platform.service';

@Directive({
	standalone: true,
	selector: '[appScrollIntoView]'
})
export class AppScrollIntoViewDirective implements OnInit, OnDestroy {
	@Input()
	set appRoot(rootHTMLElement: HTMLElement) {
		this.rootHTMLElement = rootHTMLElement;
	}

	@Input()
	set appActive(active: boolean) {
		this.active = active;
	}

	intersectionObserver: IntersectionObserver | undefined;

	rootHTMLElement: HTMLElement | undefined;

	active: boolean = false;

	constructor(
		private elementRef: ElementRef,
		private platformService: PlatformService
	) {}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			const options: IntersectionObserverInit = {
				root: this.rootHTMLElement,
				threshold: 1
			};

			// prettier-ignore
			this.intersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          return (this.active && !entry.isIntersecting && entry.target.scrollIntoView({ block: 'nearest' }));
        })
      }, options);

			this.intersectionObserver.observe(this.elementRef.nativeElement);
		}
	}

	ngOnDestroy(): void {
		[this.intersectionObserver].forEach($ => $?.disconnect());
	}
}
