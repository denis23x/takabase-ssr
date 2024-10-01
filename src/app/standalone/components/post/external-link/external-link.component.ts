/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	Output,
	ViewChild
} from '@angular/core';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { PlatformService } from '../../../../core/services/platform.service';

@Component({
	standalone: true,
	imports: [SvgIconComponent, WindowComponent],
	selector: 'app-post-external-link, [appPostExternalLink]',
	templateUrl: './external-link.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostExternalLinkComponent {
	private readonly platformService: PlatformService = inject(PlatformService);

	@ViewChild('postExternalLinkDialogElement') postExternalLinkDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostExternalLinkSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appPostExternalLinkToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input({ required: true })
	set appPostExternalLinkValue(postExternalLinkValue: string) {
		this.postExternalLinkValue = postExternalLinkValue;
	}

	postExternalLinkDialogToggle: boolean = false;
	postExternalLinkValue: string | undefined;

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
			this.platformService.getWindow().open(this.postExternalLinkValue, '_blank');
		}

		this.onTogglePostExternalLinkDialog(false);
	}
}
