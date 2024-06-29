/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class PWAService {
	pwaPrompt$: BehaviorSubject<Event | undefined> = new BehaviorSubject<Event | undefined>(undefined);
}
