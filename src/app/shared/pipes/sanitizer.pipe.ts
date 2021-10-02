/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';
import { PlatformService } from '../../core';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'sanitizer'
})
export class SanitizerPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer, private platformService: PlatformService) {}

  transform(value: string, context: string = 'html'): SafeValue | null {
    if (this.platformService.isBrowser()) {
      return this.bypassSecurityTrust(context, DOMPurify.sanitize(value));
    }

    return null;
  }

  private bypassSecurityTrust(context: string, value: string): SafeValue | null {
    switch (context) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);
      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);
      case 'resource-url':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        throw new Error('Invalid security context specified: ' + context);
    }
  }
}
