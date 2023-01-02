/** @format */

import {
	Component,
	EventEmitter,
	HostListener,
	Input,
	OnInit,
	Output
} from '@angular/core';
import { UiService } from '../../../core';

@Component({
	selector: 'app-overlay, [appOverlay]',
	templateUrl: 'overlay.component.html'
})
export class OverlayComponent implements OnInit {
	@Output() clicked: EventEmitter<void> = new EventEmitter<void>();
	@Output() escaped: EventEmitter<void> = new EventEmitter<void>();

	@Input()
	set appToggle(toggle: boolean) {
		this.uiService.setOverlay(toggle);

		this.overlayToggle = toggle;
	}

	@HostListener('document:keyup.esc', ['$event'])
	onEsc(): void {
		this.uiService.setOverlay(false);

		this.escaped.emit();
	}

	overlayToggle: boolean = false;
	overlayUUID: string | undefined;

	constructor(private uiService: UiService) {}

	ngOnInit(): void {}

	onClick(mouseEvent: MouseEvent): void {
		if (mouseEvent.target === mouseEvent.currentTarget) {
			this.uiService.setOverlay(false);

			this.clicked.emit();
		}
	}
}
