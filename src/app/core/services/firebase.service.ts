/** @format */

import { inject, Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {
	private readonly ngZone: NgZone = inject(NgZone);

	/** https://firebase.google.com/docs/web/setup#add-sdk-and-initialize */

	app: FirebaseApp | undefined;
	appCheck: AppCheck | undefined;
	auth: Auth | undefined;
	firestore: Firestore | undefined;
	storage: FirebaseStorage | undefined;

	/** APP */

	initializeApp(): FirebaseApp {
		return (this.app = initializeApp(environment.firebase));
	}

	getApp(): FirebaseApp {
		return this.app;
	}

	/** APP CHECK */

	initializeAppCheck(): void {
		return this.ngZone.runOutsideAngular(() => {
			this.appCheck = initializeAppCheck(this.getApp(), {
				provider: new ReCaptchaEnterpriseProvider(environment.appCheck),
				isTokenAutoRefreshEnabled: true
			});
		});
	}

	getAppCheck(): AppCheck {
		return this.appCheck;
	}

	/** AUTH */

	initializeAuth(): void {
		this.ngZone.runOutsideAngular(() => {
			this.auth = getAuth(this.getApp());
		});
	}

	getAuth(): Auth {
		return this.auth;
	}

	/** FIRESTORE */

	initializeFirestore(): void {
		this.firestore = getFirestore(this.getApp());
	}

	getFirestore(): Firestore {
		return this.firestore;
	}

	/** STORAGE */

	initializeStorage(): void {
		this.storage = getStorage(this.getApp());
	}

	getStorage(): FirebaseStorage {
		return this.storage;
	}
}
