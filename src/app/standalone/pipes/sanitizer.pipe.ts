/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';
import DOMPurify, { Config } from 'dompurify';

@Pipe({
	standalone: true,
	name: 'sanitizer'
})
export class SanitizerPipe implements PipeTransform {
	constructor(private domSanitizer: DomSanitizer) {}

	// prettier-ignore
	transform(value: string, context: string): SafeValue | null {
    const config: Config = {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['target']
    };

    return this.bypassSecurityTrust(context, String(DOMPurify.sanitize(value, config)));
	}

	// prettier-ignore
	private bypassSecurityTrust(context: string, value: string): SafeValue | null {
		switch (context) {
			case 'html':
				return this.domSanitizer.bypassSecurityTrustHtml(value);
			case 'style':
				return this.domSanitizer.bypassSecurityTrustStyle(value);
			case 'script':
				return this.domSanitizer.bypassSecurityTrustScript(value);
			case 'url':
				return this.domSanitizer.bypassSecurityTrustUrl(value);
			case 'resource-url':
				return this.domSanitizer.bypassSecurityTrustResourceUrl(value);
			default:
				throw new Error('Invalid security context specified: ' + context);
		}
	}
}
