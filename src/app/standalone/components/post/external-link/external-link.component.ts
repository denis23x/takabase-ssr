/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
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

	@Input({ required: true })
	set appPostExternalLinkValue(postExternalLinkValue: string) {
		this.postExternalLinkValue = postExternalLinkValue;
	}

	postExternalLinkDialogToggle: boolean = false;
	postExternalLinkValue: string | undefined;

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
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			// Redirect

			window.open(this.postExternalLinkValue, '_blank');
		}

		/** Close */

		this.onTogglePostExternalLinkDialog(false);
	}
}
