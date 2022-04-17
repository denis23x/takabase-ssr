/** @format */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-svg-icon, [appSvgIcon]',
  templateUrl: './svg-icon.component.html'
})
export class SvgIconComponent {
  @Input()
  set appSquare(square: string) {
    this.square = square;
  }

  @Input()
  set appViewBox(viewBox: string) {
    this.viewBox = viewBox;
  }

  @Input()
  set appWidth(width: string) {
    this.width = width;
  }

  @Input()
  set appHeight(height: string) {
    this.height = height;
  }

  @Input()
  set appIcon(icon: string) {
    this.icon = icon;
  }

  square: string;
  viewBox = '0 0 16 16';

  width = '1.25em';
  height = '1.25em';

  icon: string;
}
