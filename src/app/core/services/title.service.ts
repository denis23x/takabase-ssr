/** @format */

import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root'
})
export class TitleService {
	titleDelimiter: string = ' - ';

	titlePostfix: string = 'Draftnow';
	titlePostfixDelimiter: string = ' | ';

	constructor(private title: Title) {}

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
			this.setTitle([this.getTitle(), title].join(this.titleDelimiter));
		} else {
			this.setTitle(this.getTitle());
		}
	}

	// updateTitleLast(titleNext: string): void {
	// 	const title: string = this.getTitle()
	// 		.split(this.titleDelimiter)
	// 		.map((title: string, key: number, asd: string[]) =>
	// 			asd.length - 1 === key ? titleNext : title
	// 		)
	// 		.join(this.titleDelimiter);
	//
	// 	this.setTitle(title);
	// }
	//
	// updateTitleReplace(previous: string, next: string | null | undefined): void {
	// 	if (!!next) {
	// 		this.setTitle(
	// 			this.getTitle()
	// 				.split(this.titleDelimiter)
	// 				.map((title: string) => (title === previous ? next : title))
	// 				.join(this.titleDelimiter)
	// 		);
	// 	} else {
	// 		this.setTitle(
	// 			this.getTitle()
	// 				.split(this.titleDelimiter)
	// 				.filter((title: string) => title !== previous)
	// 				.join(this.titleDelimiter)
	// 		);
	// 	}
	// }
	//
	// deleteTitle(titlePrevious: string): void {
	// 	const title: string = this.getTitle()
	// 		.split(this.titleDelimiter)
	// 		.filter((title: string) => title !== titlePrevious)
	// 		.join(this.titleDelimiter);
	//
	// 	this.setTitle(title);
	// }
}
