/** @format */

import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';

@Component({
	selector: 'app-window, [appWindow]',
	templateUrl: 'window.component.html'
})
export class WindowComponent implements OnInit, OnDestroy {
	@Input()
	set appTitle(title: string) {
		this.title = title;
	}

	@Output() closed: EventEmitter<void> = new EventEmitter<void>();

	title: string | undefined;

	constructor() {}

	ngOnInit(): void {}

	ngOnDestroy(): void {}
}
