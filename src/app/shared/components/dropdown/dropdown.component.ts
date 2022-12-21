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
import { fromEvent, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
	selector: 'app-dropdown, [appDropdown]',
	templateUrl: './dropdown.component.html'
})
export class DropdownComponent implements OnInit, OnDestroy {
	@ViewChild('dropdownTarget') dropdownTarget: ElementRef | undefined;
	@ViewChild('dropdownContent') dropdownContent: ElementRef | undefined;

	@Output() toggled: EventEmitter<boolean> = new EventEmitter<boolean>();

	click$: Subscription | undefined;

	state: boolean = false;

	constructor(
		@Inject(DOCUMENT)
		private document: Document
	) {}

	ngOnInit(): void {
		this.click$ = fromEvent(this.document, 'click').subscribe({
			next: (event: any) => {
				// prettier-ignore
				const target: boolean = this.dropdownTarget.nativeElement.contains(event.target);

				// prettier-ignore
				const content: boolean = this.dropdownContent.nativeElement.contains(event.target);

				/** If closed and click on target */

				if (!this.state && target) {
					this.setState(true);
				}

				/** If opened and click on content */

				if (!!this.state && content) {
					this.setState(false);
				}

				/** If opened and click outside */

				if (!!this.state && !target && !content) {
					this.setState(false);
				}
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.click$].forEach($ => $?.unsubscribe());
	}

	setState(state: boolean): void {
		this.state = state;

		this.toggled.emit(this.state);
	}
}
