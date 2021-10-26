/** @format */

import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PlatformService } from '../../core';

@Directive({
  selector: '[appScrollIntoView]'
})
export class AppScrollIntoViewDirective implements OnInit, OnDestroy {
  @Input()
  set appRoot(root: HTMLElement) {
    this.root = root;
  }

  @Input()
  set appActive(active: boolean) {
    this.active = active;
  }

  intersectionObserver: IntersectionObserver;

  root: HTMLElement;

  active: boolean;

  constructor(private elementRef: ElementRef, private platformService: PlatformService) {}

  ngOnInit(): void {
    if (this.platformService.isBrowser()) {
      this.intersectionObserver = new IntersectionObserver(
        (entries: any) =>
          entries.forEach(
            (entry: any) =>
              this.active &&
              !entry.isIntersecting &&
              entry.target.scrollIntoView({ block: 'nearest' })
          ),
        {
          root: this.root,
          threshold: 1
        }
      );

      this.intersectionObserver.observe(this.elementRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    [this.intersectionObserver].filter($ => $).forEach($ => $.disconnect());
  }
}
