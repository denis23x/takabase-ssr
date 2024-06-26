/** @format */

import { inject, Injectable, NgZone } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { ReportSubject } from '../models/report.model';
import { ReportCreateDto } from '../dto/report/report-create.dto';
import { environment } from '../../../environments/environment';
import { AuthorizationService } from './authorization.service';
import { CurrentUser } from '../models/current-user.model';
import { HelperService } from './helper.service';
import { collection, CollectionReference, addDoc, DocumentReference } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { catchError } from 'rxjs/operators';
import { FirebaseError } from 'firebase/app';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root'
})
export class ReportService {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly ngZone: NgZone = inject(NgZone);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);

	reportSubject$: Subject<ReportSubject> = new Subject<ReportSubject>();
	reportDialogToggle$: Subject<boolean> = new Subject<boolean>();

	/** Firestore */

	// prettier-ignore
	create(reportCreateDto: ReportCreateDto): Observable<DocumentReference> {
		const currentUser: CurrentUser | undefined = this.authorizationService.currentUser.getValue();
		const currentUsername: string = currentUser.name;

		const url: URL = this.helperService.getURL();
		const urlUsername: string = [url.origin, currentUsername].join('/');

		const templateSubject: string = 'New report from user ' + currentUsername;
		const templateHtml: string = `
      <h1>
        <strong>Reporter:</strong> <a href="${urlUsername}" target="_blank"> ${currentUsername} </a>
      </h1>
      <span>
        <strong>Name:</strong> ${reportCreateDto.name}
      </span>
      <p>
        <strong>Location:</strong> <a href="${url.toString()}" target="_blank"> ${url.toString()} </a>
      </p>
      <p>
        <strong>Description:</strong> ${reportCreateDto.description}
      </p>
      <hr>
      <pre> ${JSON.stringify(reportCreateDto.subject, null, 2)} </pre>
    `;

		return this.ngZone.runOutsideAngular(() => {
			const mailerCollection: CollectionReference = collection(this.firebaseService.getFirestore(), '/mailer');

			return from(addDoc(mailerCollection, {
				to: environment.mailer.to,
				bcc: environment.mailer.bcc,
				message: {
					subject: templateSubject,
					html: templateHtml
				}
			})).pipe(catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)))
		});
	}
}
