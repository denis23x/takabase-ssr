/** @format */

import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { HelperService, PlatformService } from '../../../core';

@Component({
  selector: 'app-overlay, [appOverlay]',
  templateUrl: 'overlay.component.html'
})
export class OverlayComponent implements OnInit, OnDestroy {
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keyup.esc', ['$event'])
  onEsc(keyboardEvent: KeyboardEvent): void {
    const uuidList: string[] = this.platformService.overlayUUIDList.getValue();

    if (uuidList[uuidList.length - 1] === this.uuid) {
      this.closed.emit();
    }
  }

  uuid: string;

  constructor(private platformService: PlatformService, private helperService: HelperService) {}

  ngOnInit(): void {
    this.uuid = this.helperService.getUUID();

    this.platformService.setScrollToggle(true);

    // prettier-ignore
    this.platformService.overlayUUIDList.next(this.platformService.overlayUUIDList.getValue().concat(this.uuid));
  }

  ngOnDestroy(): void {
    this.platformService.setScrollToggle(false);

    // prettier-ignore
    this.platformService.overlayUUIDList.next(this.platformService.overlayUUIDList.getValue().filter((uuid: string) => uuid !== this.uuid));
  }

  onClick(mouseEvent: MouseEvent): void {
    if (mouseEvent.target === mouseEvent.currentTarget) {
      this.platformService.setScrollToggle(false);

      this.closed.emit();
    }
  }
}
