/** @format */

import {
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';
import { PlatformService } from '../../../core';

@Component({
	selector: 'app-dropdown, [appDropdown]',
	templateUrl: './dropdown.component.html'
})
export class DropdownComponent implements OnInit, OnDestroy {
	@ViewChild('dropdownTarget') dropdownTarget: ElementRef | undefined;
	@ViewChild('dropdownContent') dropdownContent: ElementRef | undefined;

	@Output() toggled: EventEmitter<boolean> = new EventEmitter<boolean>();

	windowClick$: Subscription | undefined;
	windowAction$: Subscription | undefined;

	dropdownState: boolean = false;
	dropdownStateStyle: Object = {
		display: 'none'
	};

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private elementRef: ElementRef,
		private platformService: PlatformService
	) {}

	ngOnInit(): void {
		this.windowClick$ = fromEvent(this.document, 'click').subscribe({
			next: (event: any) => {
				// prettier-ignore
				const target: boolean = this.dropdownTarget.nativeElement.contains(event.target);

				// prettier-ignore
				const content: boolean = this.dropdownContent.nativeElement.contains(event.target);

				/**
				 * If click on target = show/hide toggle
				 * If opened - close on click content or outside
				 */

				if (target) {
					this.setStateStyle(!this.dropdownState);
				} else if (!!this.dropdownState) {
					if (content) {
						this.setStateStyle(false);
					} else if (!target && !content) {
						this.setStateStyle(false);
					}
				}
			},
			error: (error: any) => console.error(error)
		});

		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			this.windowAction$ = merge(
				fromEvent(window, 'scroll'),
				fromEvent(window, 'resize')
			)
				.pipe(filter(() => this.dropdownState))
				.subscribe({
					next: () => this.setStateStyle(false),
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		[this.windowClick$, this.windowAction$].forEach($ => $?.unsubscribe());
	}

	setStateStyle(state: boolean): void {
		this.dropdownState = state;

		// prettier-ignore
		const elementRefStyle: any = this.elementRef.nativeElement.getBoundingClientRect();

		// prettier-ignore
		if (this.dropdownState) {
      this.dropdownStateStyle = {
        'display': 'block',
        'position': 'fixed',
        'width.px': elementRefStyle.width,
        'top.px': elementRefStyle.top + elementRefStyle.height,
        'left.px': elementRefStyle.left,
        'z-index': 2
      };
    } else {
      this.dropdownStateStyle = {
        'display': 'none'
      };
    }

		this.toggled.emit(this.dropdownState);
	}
}
