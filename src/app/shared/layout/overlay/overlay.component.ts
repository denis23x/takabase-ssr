/** @format */

import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { PlatformService } from '../../../core';

@Component({
  selector: 'app-overlay, [appOverlay]',
  templateUrl: 'overlay.component.html'
})
export class OverlayComponent implements OnInit, OnDestroy {
  @Output() clicked = new EventEmitter<void>();

  constructor(private platformService: PlatformService) {}

  ngOnInit(): void {
    this.platformService.setScrollToggle(true);
  }

  ngOnDestroy(): void {
    this.platformService.setScrollToggle(false);
  }

  onClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.platformService.setScrollToggle(false);

      this.clicked.emit();
    }
  }
}
