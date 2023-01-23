/** @format */

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root'
})
export class TitleService {
	titleValue: string = 'Draftnow';
	titleDelimiter: string = ' - ';
	titleDelimiterMain: string = ' | ';

	constructor(private title: Title) {}

	setTitle(title: string): void {
		this.title.setTitle([this.titleValue, title].join(this.titleDelimiterMain));
	}

	appendTitle(titleNext: string): void {
		// prettier-ignore
		this.title.setTitle([this.title.getTitle(), titleNext].join(this.titleDelimiter));
	}

	updateTitle(titlePrevious: string, titleNext: string): void {
		const title: string = this.title
			.getTitle()
			.split(this.titleDelimiter)
			.map((title: string) => (title === titlePrevious ? titleNext : title))
			.join(this.titleDelimiter);

		this.title.setTitle(title);
	}

	deleteTitle(titlePrevious: string): void {
		const title: string = this.title
			.getTitle()
			.split(this.titleDelimiter)
			.filter((title: string) => title !== titlePrevious)
			.join(this.titleDelimiter);

		this.title.setTitle(title);
	}
}
