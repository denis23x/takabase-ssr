/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {
	AvatarComponent,
	BackgroundComponent,
	CategoryEditComponent,
	CropperComponent,
	DropdownComponent,
	HeaderComponent,
	MarkdownComponent,
	OauthComponent,
	OverlayComponent,
	PostCardComponent,
	PostDetailComponent,
	ShareComponent,
	SnackbarComponent,
	SvgIconComponent,
	WindowComponent
} from './components';
import {
	AppAuthenticatedDirective,
	AppInputOnlyPasteDirective,
	AppInputTrimWhitespaceDirective,
	AppScrollIntoViewDirective
} from './directives';
import { DayjsPipe, MarkdownPipe, SanitizerPipe } from './pipes';
import { ImageCropperModule } from 'ngx-image-cropper';

const components: any[] = [
	AvatarComponent,
	BackgroundComponent,
	CategoryEditComponent,
	CropperComponent,
	DropdownComponent,
	HeaderComponent,
	MarkdownComponent,
	OauthComponent,
	OverlayComponent,
	PostCardComponent,
	PostDetailComponent,
	ShareComponent,
	SnackbarComponent,
	SvgIconComponent,
	WindowComponent
];

const directives: any[] = [
	AppAuthenticatedDirective,
	AppInputOnlyPasteDirective,
	AppInputTrimWhitespaceDirective,
	AppScrollIntoViewDirective
];

const pipes: any[] = [DayjsPipe, MarkdownPipe, SanitizerPipe];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpClientModule,
		ImageCropperModule,
		ReactiveFormsModule,
		RouterModule
	],
	declarations: [...components, ...directives, ...pipes],
	exports: [
		...components,
		...directives,
		...pipes,
		CommonModule,
		FormsModule,
		HttpClientModule,
		ImageCropperModule,
		ReactiveFormsModule,
		RouterModule
	]
})
export class SharedModule {}
