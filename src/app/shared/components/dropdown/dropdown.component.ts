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
  @ViewChild('dropdownTarget') dropdownTarget: ElementRef | undefined;
  @ViewChild('dropdownContent') dropdownContent: ElementRef | undefined;

  @Output() toggled: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  set appDisabled(disabled: boolean) {
    this.dropdownDisabled = disabled;
  }

  click$: Subscription | undefined;

  dropdownDisabled: boolean = false;
  dropdownState: boolean = false;

  constructor(private platformService: PlatformService, private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.click$ = fromEvent(this.elementRef.nativeElement, 'click')
      .pipe(
        debounceTime(10),
        filter(() => !this.dropdownDisabled)
      )
      .subscribe({
        next: (event: any) => {
          if (this.dropdownState && this.dropdownContent.nativeElement.contains(event.target)) {
            this.setState(false);
          } else if (this.dropdownTarget.nativeElement.contains(event.target)) {
            this.setState(true);
          }
        },
        error: (error: any) => console.error(error)
      });
  }

  ngOnDestroy(): void {
    [this.click$].forEach($ => $?.unsubscribe());
  }

  setState(state: boolean): void {
    this.dropdownState = state;

    this.toggled.emit(this.dropdownState);

    this.platformService.setScrollToggle(this.dropdownState);
  }
}
