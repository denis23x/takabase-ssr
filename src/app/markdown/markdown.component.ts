/** @format */

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { PlatformService, HelperService, Post } from '../core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { DOCUMENT } from '@angular/common';

interface PostForm {
	title: FormControl<string>;
	description: FormControl<string>;
	categoryId: FormControl<number>;
	categoryName: FormControl<string>;
	body: FormControl<string>;
}

@Component({
	selector: 'app-markdown',
	templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	postForm: FormGroup | undefined;
	postFormIsSubmitted: boolean = false;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private formBuilder: FormBuilder,
		private platformService: PlatformService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService
	) {
		this.postForm = this.formBuilder.group<PostForm>({
			title: this.formBuilder.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			description: this.formBuilder.control('', [Validators.required]),
			categoryId: this.formBuilder.control(null, [Validators.required]),
			categoryName: this.formBuilder.control('', [Validators.required]),
			body: this.formBuilder.control('', [
				Validators.required,
				Validators.minLength(24),
				Validators.maxLength(7200)
			])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(
				map((data: Data) => data.data),
				filter((post: Post) => !!post)
			)
			.subscribe({
				next: (post: Post) => this.postForm.get('body').setValue(post.body),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onSubmitPostForm(): void {
		if (this.helperService.getFormValidation(this.postForm)) {
			this.router
				.navigate(['./submit'], {
					relativeTo: this.activatedRoute,
					state: {
						postForm: this.postForm.value
					}
				})
				.then(() => console.debug('Route changed'));
		}
	}
}
