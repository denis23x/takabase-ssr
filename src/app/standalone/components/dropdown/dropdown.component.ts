/** @format */

import {
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { CookieService } from '../../../core/services/cookie.service';
import {
	computePosition,
	ComputePositionReturn,
	flip,
	MiddlewareState,
	offset,
	Placement,
	shift,
	size
} from '@floating-ui/dom';

@Component({
	standalone: true,
	imports: [CommonModule],
	selector: 'app-dropdown, [appDropdown]',
	templateUrl: './dropdown.component.html'
})
export class DropdownComponent implements OnInit, OnDestroy {
	@Output() appDropdownToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	set appDropdownPlacement(dropdownPlacement: Placement) {
		this.dropdownPlacement = dropdownPlacement;
	}

	@Input()
	set appDropdownClose(dropdownClose: boolean) {
		this.dropdownClose = dropdownClose;
	}

	@Input()
	set appDropdownFit(dropdownFit: boolean) {
		this.dropdownFit = dropdownFit;
	}

	window$: Subscription | undefined;
	windowClick$: Subscription | undefined;

	dropdownState: boolean = false;
	dropdownPlacement: Placement = 'bottom-start';
	dropdownClose: boolean = true;
	dropdownBackdrop: boolean = false;
	dropdownFit: boolean = false;

	dropdownElementTarget: HTMLElement | undefined;
	dropdownElementContent: HTMLElement | undefined;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private elementRef: ElementRef,
		private cookieService: CookieService,
		private platformService: PlatformService
	) {}

	ngOnInit(): void {
		this.dropdownElementTarget = this.elementRef.nativeElement.querySelector('[slot=target]');
		this.dropdownElementContent = this.elementRef.nativeElement.querySelector('[slot=content]');

		this.dropdownElementContent.classList.add('fixed', 'top-0', 'left-0', 'z-20', 'w-max');
		this.dropdownElementContent.style.display = 'none';

		/** onStateShow when onClick */

		this.windowClick$?.unsubscribe();
		this.windowClick$ = fromEvent(this.document, 'click').subscribe({
			next: (event: any) => {
				const clickTarget: boolean = this.dropdownElementTarget.contains(event.target);
				const clickContent: boolean = this.dropdownElementContent.contains(event.target);
				const clickOutside: boolean = !clickTarget && !clickContent;

				if (this.dropdownState) {
					if (clickTarget || clickOutside) {
						this.onStateHide();
					}

					if (clickContent) {
						if (this.dropdownClose) {
							this.onStateHide();
						}
					}
				} else {
					if (clickTarget) {
						// @ts-ignore
						const targetEnabled: boolean = !this.dropdownElementTarget.disabled;

						// prettier-ignore
						const targetEnableChildren: boolean = !Array.from(this.dropdownElementTarget.querySelectorAll('[disabled]')).length;

						if (!!targetEnabled && !!targetEnableChildren) {
							this.onStateShow();
						}
					}
				}
			},
			error: (error: any) => console.error(error)
		});

		/** onStateHide when onScroll && onResize */

		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			// Not affecting hydration

			this.window$?.unsubscribe();
			this.window$ = merge(fromEvent(window, 'scroll'), fromEvent(window, 'resize')).subscribe({
				next: () => this.onStateHide(),
				error: (error: any) => console.error(error)
			});
		}
	}

	ngOnDestroy(): void {
		[this.window$, this.windowClick$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onStateShow(): void {
		this.dropdownState = true;
		this.dropdownElementContent.style.display = 'flex';
		this.dropdownBackdrop = !!Number(this.cookieService.getItem('dropdown-backdrop'));

		this.appDropdownToggle.emit(this.dropdownState);

		this.onStateUpdate();
	}

	onStateHide(): void {
		this.dropdownState = false;
		this.dropdownElementContent.style.display = 'none';

		this.appDropdownToggle.emit(this.dropdownState);
	}

	onStateUpdate(): void {
		computePosition(this.dropdownElementTarget, this.dropdownElementContent, {
			strategy: 'fixed',
			placement: this.dropdownPlacement,
			middleware: [
				offset({
					mainAxis: 12
				}),
				flip(),
				shift(),
				size({
					apply(middlewareState: MiddlewareState & any) {
						Object.assign(middlewareState.elements.floating.style, {
							maxWidth: middlewareState.availableWidth + 'px',
							maxHeight: middlewareState.availableHeight + 'px'
						});
					}
				})
			]
		})
			.then((computePositionReturn: ComputePositionReturn) => {
				Object.assign(this.dropdownElementContent.style, {
					left: computePositionReturn.x + 'px',
					top: computePositionReturn.y + 'px'
				});

				if (this.dropdownFit) {
					const elementDOMRect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();

					Object.assign(this.dropdownElementContent.style, {
						width: elementDOMRect.width + 'px'
					});
				}
			})
			.catch((error: any) => console.error(error));
	}
}
