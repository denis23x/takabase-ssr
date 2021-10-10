/** @format */

import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { toSvg } from 'jdenticon';
import { PlatformService } from '../../../core';
import { User } from '../../../user/core';
import { filter, startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-avatar, [appAvatar]',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent implements OnInit, OnDestroy {
  @Input()
  set appUser(user: User) {
    this.user = user;
  }

  @Input()
  set appSize(size: number) {
    this.size = size;
  }

  constructor(private platformService: PlatformService, private elementRef: ElementRef) {}

  user: User;
  size: number;

  avatar: string;
  windowResize$: Subscription;

  ngOnInit(): void {
    if (!this.size) {
      if (this.platformService.isBrowser()) {
        this.windowResize$ = this.platformService
          .getResize(10)
          .pipe(
            startWith(0),
            filter(() => this.size !== this.elementRef.nativeElement.clientWidth)
          )
          .subscribe(() => {
            this.size = this.elementRef.nativeElement.clientWidth;
            this.getAvatar();
          });
      }
    } else {
      this.getAvatar();
    }
  }

  ngOnDestroy(): void {
    [this.windowResize$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getAvatar(): void {
    this.avatar = this.user.avatar ? this.getImage() : this.getJdenticon();
  }

  getImage(): string {
    return `<img
      class="block object-cover"
      loading="lazy"
      width="${this.size}"
      height="${this.size}"
      src="${this.user.avatar}"
      alt="${this.user.name}">`;
  }

  getJdenticon(): string {
    return toSvg(this.user.name, this.size, {
      padding: 0
    });
  }
}
