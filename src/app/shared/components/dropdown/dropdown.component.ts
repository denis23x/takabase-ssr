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
  @ViewChild('target') target: ElementRef;
  @ViewChild('content') content: ElementRef;

  @Output() toggled = new EventEmitter<boolean>();

  @Input()
  set appDisabled(disabled: boolean) {
    this.disabled = disabled;
  }

  click$: Subscription;

  disabled: boolean = false;

  state: boolean = false;

  constructor(private platformService: PlatformService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.click$ = fromEvent(this.elementRef.nativeElement, 'click')
      .pipe(
        debounceTime(10),
        filter(() => !this.disabled)
      )
      .subscribe({
        next: (event: any) => {
          if (this.state && this.content.nativeElement.contains(event.target)) {
            this.setState(false);
          } else if (this.target.nativeElement.contains(event.target)) {
            this.setState(true);
          }
        },
        error: (error: any) => console.error(error),
        complete: () => console.debug('Element reference click subscription complete')
      });
  }

  ngOnDestroy(): void {
    [this.click$].forEach($ => $?.unsubscribe());
  }

  setState(state: boolean): void {
    this.state = state;

    this.toggled.emit(this.state);

    this.platformService.setScrollToggle(this.state);
  }
}
