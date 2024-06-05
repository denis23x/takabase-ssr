/** @format */

import { Directive, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
	standalone: true,
	selector: '[appInputShowPassword]'
})
export class InputShowPassword implements OnInit {
	@HostListener('touchstart', ['$event']) onTouchstart(): void {
		this.onShow();
	}

	@HostListener('touchend', ['$event']) onTouchend(): void {
		this.onHide();
	}

	@HostListener('mouseenter', ['$event']) onMouseenter(): void {
		this.onShow();
	}

	@HostListener('mouseleave', ['$event']) onMouseleave(): void {
		this.onHide();
	}

	@Input({ required: true })
	set appInputShowPasswordInputElement(inputShowPasswordInputElement: HTMLInputElement) {
		this.inputShowPasswordInputElement = inputShowPasswordInputElement;
	}

	@Input({ required: true })
	set appInputShowPasswordFormControl(inputShowPasswordFormControl: AbstractControl) {
		this.inputShowPasswordFormControl = inputShowPasswordFormControl;
	}

	private readonly elementRef: ElementRef = inject(ElementRef);

	inputShowPasswordFieldsetElement: HTMLFieldSetElement;
	inputShowPasswordInputElement: HTMLInputElement;
	inputShowPasswordFormControl: AbstractControl;

	ngOnInit(): void {
		// Get parent fieldset element

		let parentElement: HTMLElement | HTMLFieldSetElement = this.elementRef.nativeElement.parentElement;

		while (parentElement.tagName.toLowerCase() !== 'fieldset') {
			parentElement = parentElement.parentElement;
		}

		this.inputShowPasswordFieldsetElement = parentElement as HTMLFieldSetElement;
	}

	onShow(): void {
		if (this.inputShowPasswordFormControl.enabled && !this.inputShowPasswordFieldsetElement.disabled) {
			this.inputShowPasswordInputElement.type = 'text';
		}
	}

	onHide(): void {
		if (this.inputShowPasswordFormControl.enabled && !this.inputShowPasswordFieldsetElement.disabled) {
			this.inputShowPasswordInputElement.type = 'password';
		}
	}
}
