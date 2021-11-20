/** @format */

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { PlatformService } from '../../../core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-dropdown, [appDropdown]',
  templateUrl: './dropdown.component.html'
})
export class DropdownComponent implements OnInit, OnDestroy {
  @ViewChild('target') target: any;
  @ViewChild('content') content: any;

  @Output() toggled = new EventEmitter<boolean>();

  @Input()
  set appDisabled(disabled: boolean) {
    this.disabled = disabled;
  }

  click$: Subscription;

  disabled = false;

  state = false;

  constructor(private platformService: PlatformService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.click$ = fromEvent(this.elementRef.nativeElement, 'click')
      .pipe(
        debounceTime(10),
        filter(() => !this.disabled)
      )
      .subscribe((event: any) => {
        if (this.state && this.content.nativeElement.contains(event.target)) {
          this.setState(false);
        } else if (this.target.nativeElement.contains(event.target)) {
          this.setState(true);
        }
      });
  }

  ngOnDestroy(): void {
    [this.click$].filter($ => $).forEach($ => $.unsubscribe());
  }

  setState(state: boolean): void {
    this.state = state;

    this.toggled.emit(this.state);

    this.platformService.setScrollToggle(this.state);
  }
}
