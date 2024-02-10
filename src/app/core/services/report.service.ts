/** @format */

import { inject, Injectable, NgZone } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { ReportSubject } from '../models/report.model';
import { ReportCreateDto } from '../dto/report/report-create.dto';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { environment } from '../../../environments/environment';
import { AuthorizationService } from './authorization.service';
import firebase from 'firebase/compat';
import { CurrentUser } from '../models/current-user.model';
import { HelperService } from './helper.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class ReportService {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly userService: UserService = inject(UserService);
	private readonly angularFirestore: AngularFirestore = inject(AngularFirestore);
	private readonly ngZone: NgZone = inject(NgZone);

	reportSubject$: Subject<ReportSubject> = new Subject<ReportSubject>();
	reportDialogToggle$: Subject<boolean> = new Subject<boolean>();

	/** Firestore */

	// prettier-ignore
	create(reportCreateDto: ReportCreateDto): Observable<firebase.firestore.DocumentReference<unknown>> {
		const currentUser: CurrentUser | undefined = this.authorizationService.currentUser.getValue();

		const url: URL = this.helperService.getURL();
		const urlCurrentUser: string = this.userService.getUserUrl(currentUser);

		const templateSubject: string = 'New report from user ' + urlCurrentUser.substring(1);
		const templateHtml: string = `
      <h1>
        <strong>Reporter:</strong> <a href="${url.origin + urlCurrentUser}" target="_blank"> ${urlCurrentUser.substring(1)} </a>
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
			return from(
				this.angularFirestore.collection('mailer').add({
					to: environment.mailer.to,
					bcc: environment.mailer.bcc,
					message: {
						subject: templateSubject,
						html: templateHtml
					}
				})
			);
		});
	}
}
