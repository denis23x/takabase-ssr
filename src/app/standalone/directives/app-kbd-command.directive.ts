/** @format */

import { Directive, ElementRef, inject, OnInit } from '@angular/core';
import { HelperService } from '../../core/services/helper.service';

@Directive({
	standalone: true,
	selector: '[appKbdCommand]'
})
export class KbdCommandDirective implements OnInit {
	private readonly helperService: HelperService = inject(HelperService);
	private readonly elementRef: ElementRef = inject(ElementRef);

	ngOnInit(): void {
		this.elementRef.nativeElement.innerText = this.helperService.getOSCommandKey();
	}
}
