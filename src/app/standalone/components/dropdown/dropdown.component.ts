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
	set appPosition(dropdownPosition: string) {
		this.dropdownPosition = dropdownPosition;
	}

	@Input()
	set appFitParentWidth(dropdownContentFitParentWidth: boolean) {
		this.dropdownContentFitParentWidth = dropdownContentFitParentWidth;
	}

	@Input()
	set appCloseOnClick(dropdownContentCloseOnClick: boolean) {
		this.dropdownContentCloseOnClick = dropdownContentCloseOnClick;
	}

	windowClick$: Subscription | undefined;
	windowAction$: Subscription | undefined;

	dropdownState: boolean = false;
	dropdownPosition: string = 'bottom-left';

	dropdownTarget: any;
	dropdownTargetCheckDisabled: boolean = true;

	dropdownContent: any;
	dropdownContentCloseOnClick: boolean = true;
	dropdownContentFitParentWidth: boolean = false;

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

    /** Set initial state */

		this.setStateStyle(false, false);

    /** Clicks handler */

    this.windowClick$ = fromEvent(this.document, 'click').subscribe({
			next: (event: any) => {
				const clickTarget: boolean = this.dropdownTarget.contains(event.target);
				const clickContent: boolean = this.dropdownContent.contains(event.target);

				/**
				 * If click on target = show/hide toggle (if target not disabled)
				 * If opened - close on click content or outside
				 */

				if (clickTarget) {
          if (this.dropdownTargetCheckDisabled) {
            const targetEnabled: boolean = !this.dropdownTarget.disabled;
            const targetEnableChildren: boolean = !Array.from(this.dropdownTarget.querySelectorAll('[disabled]')).length;

            if (!!targetEnabled && !!targetEnableChildren) {
              this.setStateStyle(!this.dropdownState);
            }
          } else {
            this.setStateStyle(!this.dropdownState);
          }
				} else if (this.dropdownState) {
					if (clickContent) {
						if (this.dropdownContentCloseOnClick) {
							this.setStateStyle(false);
						}
					} else if (!clickTarget && !clickContent) {
						this.setStateStyle(false);
					}
				}
			},
			error: (error: any) => console.error(error)
		});

    /** Close on scroll && resize */

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
		// prettier-ignore
		[this.windowClick$, this.windowAction$].forEach(($: Subscription) => $?.unsubscribe());
	}

	// prettier-ignore
	setStateStyle(state: boolean, emit: boolean = true): void {
    if (this.platformService.isBrowser()) {
      const elementDOMRect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();

      this.dropdownState = state;

      if (this.dropdownState) {
        this.dropdownContent.style['position'] = 'fixed';
        this.dropdownContent.style['visibility'] = 'visible';

        /** Apply position */

        switch (this.dropdownPosition) {
          case 'bottom-left': {
            this.dropdownContent.style['top'] = elementDOMRect.top + elementDOMRect.height + 'px';
            this.dropdownContent.style['left'] = elementDOMRect.left + 'px';

            break;
          }
          case 'bottom-right': {
            const contentDOMRect: DOMRect = this.dropdownContent.getBoundingClientRect();

            this.dropdownContent.style['top'] = elementDOMRect.top + elementDOMRect.height + 'px';
            this.dropdownContent.style['left'] = elementDOMRect.left - (contentDOMRect.width - elementDOMRect.width) + 'px';

            break;
          }
          default: {
            break;
          }
        }

        this.dropdownContent.style['z-index'] = 2;
      } else {
        this.dropdownContent.style['position'] = 'fixed';
        this.dropdownContent.style['visibility'] = 'hidden';
      }

      if (this.dropdownContentFitParentWidth) {
        this.dropdownContent.style['width'] = elementDOMRect.width + 'px';
      }

      if (emit) {
        this.toggled.emit(this.dropdownState);
      }
    }
  }
}
