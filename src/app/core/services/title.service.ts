/** @format */

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class TitleService extends TitleStrategy {
	titleDelimiter: string = ' - ';

	titlePostfix: string = 'Draft';
	titlePostfixDelimiter: string = ' | ';

	constructor(private readonly title: Title) {
		super();
	}

	override updateTitle(routerState: RouterStateSnapshot): void {
		const title: string | undefined = this.buildTitle(routerState);

		if (title !== undefined) {
			this.title.setTitle(this.getTitleFormatted(title));
		}
	}

	setTitle(title: string | null | undefined): void {
		if (!!title) {
			this.title.setTitle(this.getTitleFormatted(title));
		} else {
			this.title.setTitle(this.titlePostfix);
		}
	}

	getTitle(): string {
		return this.title.getTitle().split(this.titlePostfixDelimiter).shift();
	}

	getTitleFormatted(title: string, append: boolean = false): string {
		if (!!append) {
			return [this.getTitle(), title].reverse().join(this.titleDelimiter);
		} else {
			return [title, this.titlePostfix].join(this.titlePostfixDelimiter);
		}
	}

	appendTitle(title: string | null | undefined): void {
		if (!!title) {
			this.setTitle(this.getTitleFormatted(title, true));
		} else {
			this.setTitle(this.getTitle());
		}
	}
}
