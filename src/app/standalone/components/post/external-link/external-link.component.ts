/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { Location } from '@angular/common';

@Component({
	standalone: true,
	imports: [SvgIconComponent, WindowComponent],
	selector: 'app-post-external-link, [appPostExternalLink]',
	templateUrl: './external-link.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostExternalLinkComponent implements OnInit {
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);

	@ViewChild('postExternalLinkDialogElement') postExternalLinkDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostExternalLinkSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appPostExternalLinkToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	postExternalLinkDialogToggle: boolean = false;

	ngOnInit(): void {
		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onTogglePostExternalLinkDialog(false));
		}
	}

	onTogglePostExternalLinkDialog(toggle: boolean): void {
		this.postExternalLinkDialogToggle = toggle;

		if (toggle) {
			this.postExternalLinkDialogElement.nativeElement.showModal();
		} else {
			this.postExternalLinkDialogElement.nativeElement.close();
		}

		this.appPostExternalLinkToggle.emit(toggle);
	}

	onSubmitPostExternalLink(): void {
		this.appPostExternalLinkSubmit.emit(true);

		/** Close */

		this.onTogglePostExternalLinkDialog(false);
	}
}
