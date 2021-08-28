/** @format */

import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable()
export class LocalStorageService {
  constructor(private platformService: PlatformService) {}

  getItem(item: string): string {
    if (this.platformService.isBrowser()) {
      return this.platformService.getWindow().localStorage[item];
    }

    return '';
  }

  setItem(key: string, value: string): void {
    if (this.platformService.isBrowser()) {
      this.platformService.getWindow().localStorage[key] = value;
    }
  }

  removeItem(item: string): void {
    if (this.platformService.isBrowser()) {
      return this.platformService.getWindow().localStorage.removeItem(item);
    }
  }
}
