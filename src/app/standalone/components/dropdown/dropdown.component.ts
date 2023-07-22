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
import { filter } from 'rxjs/operators';
import { PlatformService } from '../../../core/services/platform.service';

@Component({
	standalone: true,
	imports: [CommonModule],
	selector: 'app-dropdown, [appDropdown]',
	templateUrl: './dropdown.component.html'
})
export class DropdownComponent implements OnInit, OnDestroy {
	@Output() toggled: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input()
	set appCloseOnContentClick(dropdownStateCloseOnContentClick: boolean) {
		this.dropdownStateCloseOnContentClick = dropdownStateCloseOnContentClick;
	}

	windowClick$: Subscription | undefined;
	windowAction$: Subscription | undefined;

	dropdownState: boolean = false;
	dropdownStateCloseOnContentClick: boolean = true;

	dropdownTarget: any;
	dropdownContent: any;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private elementRef: ElementRef,
		private platformService: PlatformService
	) {}

	// prettier-ignore
	ngOnInit(): void {
		this.dropdownTarget = this.elementRef.nativeElement.querySelector('[slot=target]');
		this.dropdownContent = this.elementRef.nativeElement.querySelector('[slot=content]');

		this.setStateStyle(false, false);

    setTimeout(() => {
      console.log(this.dropdownTarget.disabled);
    }, 1000)

    this.windowClick$ = fromEvent(this.document, 'click').subscribe({
			next: (event: any) => {
				const clickTarget: boolean = this.dropdownTarget.contains(event.target);
				const clickContent: boolean = this.dropdownContent.contains(event.target);

				/**
				 * If click on target = show/hide toggle (if target not disabled)
				 * If opened - close on click content or outside
				 */

				if (clickTarget) {
          if (!this.dropdownTarget.disabled) {
            this.setStateStyle(!this.dropdownState);
          }
				} else if (this.dropdownState) {
					if (clickContent) {
						if (this.dropdownStateCloseOnContentClick) {
							this.setStateStyle(false);
						}
					} else if (!clickTarget && !clickContent) {
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

	// prettier-ignore
	setStateStyle(state: boolean, emit: boolean = true): void {
		this.dropdownState = state;

		if (this.dropdownState) {
      const elementDOMRect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();

      this.dropdownContent.style['position'] = 'fixed';
      this.dropdownContent.style['visibility'] = 'visible';
      this.dropdownContent.style['width'] = elementDOMRect.width + 'px';
      this.dropdownContent.style['top'] = elementDOMRect.top + elementDOMRect.height + 'px';
      this.dropdownContent.style['left'] = elementDOMRect.left + 'px';
      this.dropdownContent.style['z-index'] = 2;
    } else {
      this.dropdownContent.style['position'] = 'fixed';
      this.dropdownContent.style['visibility'] = 'hidden';
    }

    if (emit) {
      this.toggled.emit(this.dropdownState);
    }
	}
}
