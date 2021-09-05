/** @format */

import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { PlatformService } from '../../../core';

@Component({
  selector: 'app-dropdown, [appDropdown]',
  templateUrl: './dropdown.component.html'
})
export class DropdownComponent {
  @Output() toggle = new EventEmitter<boolean>();

  @Input()
  set appClose(close: boolean) {
    this.close = close;
  }

  state = false;
  close = true;

  constructor(private platformService: PlatformService) {}

  onToggle(target: string = 'toggle'): void {
    this.state = target === 'content' && !this.close ? true : !this.state;
    this.toggle.emit(this.state);

    this.platformService.setScrollToggle(this.state);
  }
}
