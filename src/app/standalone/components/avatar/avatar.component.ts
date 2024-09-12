/** @format */

import { Component, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { toSvg } from 'jdenticon';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { HelperService } from '../../../core/services/helper.service';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
	standalone: true,
	selector: 'app-avatar, [appAvatar]',
	templateUrl: './avatar.component.html'
})
export class AvatarComponent implements OnInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly elementRef: ElementRef = inject(ElementRef);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly helperService: HelperService = inject(HelperService);

	@Input({ required: true })
	set appAvatarPhotoUrl(photoUrl: string | null) {
		this.avatarPhotoUrl = photoUrl;
		this.avatar$.next(this.avatarPhotoUrl);
	}

	@Input({ required: true })
	set appAvatarName(name: string) {
		this.avatarName = name;
		this.avatar$.next(this.avatarPhotoUrl);
	}

	avatarPhotoUrl: string | null;
	avatarName: string | undefined;
	avatar$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

	ngOnInit(): void {
		this.avatar$.pipe(debounceTime(10)).subscribe({
			next: () => (this.avatarPhotoUrl ? this.setImage() : this.setIcon()),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		this.avatar$.complete();
	}

	setImage(): void {
		if (this.platformService.isBrowser()) {
			const elementRef: HTMLElement = this.elementRef.nativeElement;
			const elementRefImage: HTMLImageElement = this.document.createElement('img');

			// @ts-ignore
			elementRefImage.itemprop = 'image';
			elementRefImage.id = this.helperService.getNanoId(12);
			elementRefImage.classList.add(...['bg-base-300', 'object-cover', 'object-center']);
			elementRefImage.src = './assets/images/placeholder-image.svg';
			elementRefImage.alt = this.avatarName;
			elementRefImage.loading = 'eager';

			/** Insert HTML */

			elementRef.innerHTML = elementRefImage.outerHTML;

			const elementHTML: HTMLElement | null = this.document.getElementById(elementRefImage.id);
			const elementHTMLImage: HTMLImageElement = elementHTML as HTMLImageElement;

			if (this.avatarPhotoUrl.includes(environment.firebase.storageBucket)) {
				elementHTMLImage.src = this.helperService.getImageURLQueryParams(this.avatarPhotoUrl);
			} else {
				elementHTMLImage.src = this.avatarPhotoUrl;
			}
		}
	}

	setIcon(): void {
		if (this.platformService.isBrowser()) {
			const elementRef: HTMLElement = this.elementRef.nativeElement;
			const elementRefDOMRect: DOMRect = elementRef.getBoundingClientRect();

			elementRef.innerHTML = toSvg(this.avatarName, elementRefDOMRect.width, {
				backColor: '#00000000',
				padding: 0,
				replaceMode: 'observe'
			});
		}
	}
}
