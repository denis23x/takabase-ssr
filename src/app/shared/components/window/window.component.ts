/** @format */

import {
	Component,
	EventEmitter,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';

@Component({
	selector: 'app-window, [appWindow]',
	templateUrl: 'window.component.html'
})
export class WindowComponent implements OnInit, OnDestroy {
	@Output() closed: EventEmitter<void> = new EventEmitter<void>();

	constructor() {}

	ngOnInit(): void {}

	ngOnDestroy(): void {}
}
