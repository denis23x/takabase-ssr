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
			// prettier-ignore
			this.title.setTitle([title, this.titlePostfix].join(this.titlePostfixDelimiter));
		}
	}

	setTitle(title: string | null | undefined): void {
		if (!!title) {
			// prettier-ignore
			this.title.setTitle([title, this.titlePostfix].join(this.titlePostfixDelimiter));
		} else {
			this.title.setTitle(this.titlePostfix);
		}
	}

	getTitle(): string {
		return this.title.getTitle().split(this.titlePostfixDelimiter).shift();
	}

	appendTitle(title: string | null | undefined): void {
		if (!!title) {
			// prettier-ignore
			this.setTitle([this.getTitle(), title].reverse().join(this.titleDelimiter));
		} else {
			this.setTitle(this.getTitle());
		}
	}
}
