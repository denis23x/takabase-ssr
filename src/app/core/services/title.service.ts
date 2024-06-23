/** @format */

import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root'
})
export class TitleService {
	private readonly title: Title = inject(Title);

	titlePostfix: string = 'Takabase';
	titlePostfixDelimiter: string = ' - ';

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
