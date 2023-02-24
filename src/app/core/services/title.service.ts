/** @format */

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class TitleService extends TitleStrategy {
	titleDelimiter: string = ' | ';

	titlePostfix: string = 'Draft';
	titlePostfixDelimiter: string = ' - ';

	constructor(private readonly title: Title) {
		super();
	}

	override updateTitle(routerStateSnapshot: RouterStateSnapshot): void {
		const title: string | undefined = this.buildTitle(routerStateSnapshot);

		if (!!title) {
			this.title.setTitle(this.getTitleFormatted(title));
		}
	}

	setTitle(title: string): void {
		this.title.setTitle(this.getTitleFormatted(title));
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

	appendTitle(title: string): void {
		this.setTitle(this.getTitleFormatted(title, true));
	}
}
