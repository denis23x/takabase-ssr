/** @format */

import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnDestroy,
	Output
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { CookiesService } from '../../../core/services/cookies.service';
import {
	autoUpdate,
	computePosition,
	ComputePositionReturn,
	flip,
	hide,
	MiddlewareState,
	offset,
	Placement,
	shift,
	size
} from '@floating-ui/dom';
import { HelperService } from '../../../core/services/helper.service';

@Component({
	standalone: true,
	selector: 'app-dropdown, [appDropdown]',
	templateUrl: './dropdown.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent implements AfterViewInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly elementRef: ElementRef = inject(ElementRef);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

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

	@Input()
	set appDropdownActiveClassList(dropdownActiveClassList: string[]) {
		this.dropdownActiveClassList = dropdownActiveClassList;
	}

	window$: Subscription | undefined;
	windowClick$: Subscription | undefined;

	dropdownId: string | undefined;
	dropdownState: boolean = false;
	dropdownPlacement: Placement = 'bottom-start';
	dropdownClose: boolean = true;
	dropdownBackdrop: boolean = false;
	dropdownFit: boolean = false;
	dropdownActiveClassList: string[] = [];
	dropdownAutoUpdate: () => void;

	dropdownElementTarget: HTMLElement | undefined;
	dropdownElementContent: HTMLElement | undefined;

	ngAfterViewInit(): void {
		this.dropdownId = this.helperService.getNanoId();

		this.dropdownElementTarget = this.elementRef.nativeElement.querySelector('[slot=target]');
		this.dropdownElementContent = this.elementRef.nativeElement.querySelector('[slot=content]');

		this.dropdownElementContent.classList.add('fixed', 'top-0', 'left-0', 'z-20');
		this.dropdownElementContent.style.visibility = 'hidden';

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

				// Update view

				this.changeDetectorRef.detectChanges();
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.window$, this.windowClick$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onStateShow(): void {
		this.dropdownState = true;
		this.dropdownElementContent.style.visibility = 'visible';
		this.dropdownBackdrop = !!Number(this.cookiesService.getItem('dropdown-backdrop'));

		this.elementRef.nativeElement.classList.add(...this.dropdownActiveClassList);

		this.appDropdownToggle.emit(this.dropdownState);

		/** Auto update */

		this.dropdownAutoUpdate = autoUpdate(
			this.dropdownElementTarget,
			this.dropdownElementContent,
			this.onStateUpdate.bind(this)
		);
	}

	onStateHide(): void {
		this.dropdownState = false;
		this.dropdownElementContent.style.visibility = 'hidden';

		this.elementRef.nativeElement.classList.remove(...this.dropdownActiveClassList);

		this.appDropdownToggle.emit(this.dropdownState);

		/** Auto update */

		this.dropdownAutoUpdate();
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
				}),
				hide()
			]
		})
			.then((computePositionReturn: ComputePositionReturn) => {
				Object.assign(this.dropdownElementContent.style, {
					left: computePositionReturn.x + 'px',
					top: computePositionReturn.y + 'px'
				});

				// When dropdownElementTarget goes outside of overflow

				if (computePositionReturn.middlewareData.hide) {
					if (computePositionReturn.middlewareData.hide.referenceHidden) {
						if (!this.dropdownElementContent.contains(this.document.activeElement)) {
							this.onStateHide();
						}
					}
				}

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
