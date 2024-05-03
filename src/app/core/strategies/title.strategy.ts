/** @format */

import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TitleService } from '../services/title.service';

@Injectable({
	providedIn: 'root'
})
export class AppTitleStrategy extends TitleStrategy {
	private readonly title: Title = inject(Title);
	private readonly titleService: TitleService = inject(TitleService);

	constructor() {
		super();
	}

	override updateTitle(routerStateSnapshot: RouterStateSnapshot): void {
		const title: string | undefined = this.buildTitle(routerStateSnapshot);

		if (title) {
			this.title.setTitle(this.titleService.getTitleFormatted(title));
		}
	}
}
