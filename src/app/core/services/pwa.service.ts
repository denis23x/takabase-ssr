/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PWAService {
	pwaPrompt$: BehaviorSubject<Event | undefined> = new BehaviorSubject<Event | undefined>(undefined);
}
