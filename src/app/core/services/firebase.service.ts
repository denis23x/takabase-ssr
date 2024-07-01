/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import { getAnalytics, Analytics } from 'firebase/analytics';

/** https://firebase.google.com/docs/web/setup#add-sdk-and-initialize */

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {
	app: FirebaseApp | undefined;
	appCheck: AppCheck | undefined;
	auth: Auth | undefined;
	firestore: Firestore | undefined;
	storage: FirebaseStorage | undefined;
	remoteConfig: RemoteConfig | undefined;
	analytics: Analytics | undefined;

	/** APP */

	initializeApp(): FirebaseApp {
		return (this.app = initializeApp(environment.firebase, 'takabase'));
	}

	getApp(): FirebaseApp {
		return this.app;
	}

	/** APP CHECK */

	initializeAppCheck(): void {
		this.appCheck = initializeAppCheck(this.getApp(), {
			provider: new ReCaptchaEnterpriseProvider(environment.appCheck),
			isTokenAutoRefreshEnabled: true
		});
	}

	getAppCheck(): AppCheck {
		return this.appCheck;
	}

	/** AUTH */

	initializeAuth(): void {
		this.auth = getAuth(this.getApp());
		this.auth.useDeviceLanguage();
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

	/** REMOTE CONFIG */

	initializeRemoteConfig(): void {
		this.remoteConfig = getRemoteConfig(this.getApp());
		this.remoteConfig.settings.minimumFetchIntervalMillis = 43200000;
		this.remoteConfig.defaultConfig = {
			appearance: JSON.stringify(environment.remoteConfig.appearance),
			forbiddenUsername: JSON.stringify(environment.remoteConfig.forbiddenUsername)
		};
	}

	getRemoteConfig(): RemoteConfig {
		return this.remoteConfig;
	}

	/** ANALYTICS */

	initializeAnalytics(): void {
		this.analytics = getAnalytics(this.getApp());
	}

	getAnalytics(): Analytics {
		return this.analytics;
	}
}
