/** @format */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpAuthInterceptor } from './interceptors';
import {
	ApiService,
	HelperService,
	LocalStorageService,
	MarkdownService,
	MarkdownPluginService,
	PlatformService,
	SnackbarService,
	TitleService,
	UiService
} from './services';

@NgModule({
	imports: [CommonModule],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpAuthInterceptor,
			multi: true
		},
		ApiService,
		HelperService,
		LocalStorageService,
		MarkdownService,
		MarkdownPluginService,
		PlatformService,
		SnackbarService,
		TitleService,
		UiService
	],
	declarations: []
})
export class CoreModule {}
