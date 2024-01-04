/** @format */

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { FileService } from '../../../../core/services/file.service';

@Component({
	standalone: true,
	imports: [CommonModule, SvgIconComponent, WindowComponent],
	selector: 'app-post-delete-image, [appPostDeleteImage]',
	templateUrl: './delete-image.component.html'
})
export class PostDeleteImageComponent {
	// prettier-ignore
	@ViewChild('postDeleteImageDialogElement') postDeleteImageDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appPostDeleteImageSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appPostDeleteImageToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	@Input({ required: true })
	set appPostDeleteImage(image: string | null) {
		this.postDeleteImage = image;
	}

	postDeleteImage: string | undefined;
	postDeleteImageDialogToggle: boolean = false;
	postDeleteImageIsSubmitted: boolean = false;

	constructor(private fileService: FileService) {}

	onTogglePostDeleteImageDialog(toggle: boolean): void {
		this.postDeleteImageDialogToggle = toggle;

		if (toggle) {
			this.postDeleteImageDialogElement.nativeElement.showModal();
		} else {
			this.postDeleteImageDialogElement.nativeElement.close();
		}

		this.appPostDeleteImageToggle.emit(toggle);
	}

	onSubmitPostDeleteImage(): void {
		if (this.postDeleteImage) {
			this.postDeleteImageIsSubmitted = true;

			this.fileService.delete(this.postDeleteImage).subscribe({
				next: () => {
					this.onTogglePostDeleteImageDialog(false);

					this.postDeleteImageIsSubmitted = false;

					this.appPostDeleteImageSubmit.emit();
				},
				error: (error: any) => console.error(error)
			});
		}
	}
}
