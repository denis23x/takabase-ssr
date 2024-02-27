/** @format */

import { Injectable } from '@angular/core';
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
	app: FirebaseApp | undefined;
	appCheck: AppCheck | undefined;

	auth: Auth | undefined;

	firestore: Firestore | undefined;

	storage: FirebaseStorage | undefined;

	/** https://firebase.google.com/docs/web/setup#add-sdk-and-initialize */

	getApp(): FirebaseApp {
		if (!this.app) {
			this.app = initializeApp(environment.firebase);
		}

		return this.app;
	}

	getAppCheck(): AppCheck {
		if (!this.appCheck) {
			this.appCheck = initializeAppCheck(this.getApp(), {
				provider: new ReCaptchaEnterpriseProvider(environment.appCheck),
				isTokenAutoRefreshEnabled: true
			});
		}

		return this.appCheck;
	}

	getAuth(): Auth {
		if (!this.auth) {
			this.auth = getAuth(this.getApp());
		}

		return this.auth;
	}

	getFirestore(): Firestore {
		if (!this.firestore) {
			this.firestore = getFirestore(this.getApp());
		}

		return this.firestore;
	}

	getStorage(bucket?: string): FirebaseStorage {
		if (!this.storage) {
			this.storage = getStorage(this.getApp(), bucket);
		}

		return this.storage;
	}
}
