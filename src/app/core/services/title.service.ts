/** @format */

import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class TitleService extends TitleStrategy {
	private readonly title: Title = inject(Title);

	titlePostfix: string = 'Takabase';
	titlePostfixDelimiter: string = ' | ';

	constructor() {
		super();
	}

	override updateTitle(routerStateSnapshot: RouterStateSnapshot): void {
		const title: string | undefined = this.buildTitle(routerStateSnapshot);

		if (title) {
			this.title.setTitle(this.getTitleFormatted(title));
		}
	}

	setTitle(title: string): void {
		this.title.setTitle(this.getTitleFormatted(title));
	}

	getTitle(): string {
		return this.title.getTitle().split(this.titlePostfixDelimiter).shift().trim();
	}

	getTitleFormatted(title: string): string {
		return [title, this.titlePostfix].join(this.titlePostfixDelimiter);
	}
}
