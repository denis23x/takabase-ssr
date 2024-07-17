/** @format */

import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAppCheck, AppCheck, CustomProvider, AppCheckToken } from 'firebase/app-check';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { ApiService } from './api.service';
import type { AppCheckDto } from '../dto/authorization/app-check.dto';

/** https://firebase.google.com/docs/web/setup#add-sdk-and-initialize */

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {
	private readonly apiService: ApiService = inject(ApiService);

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

	getCustomProvider(): CustomProvider {
		return new CustomProvider({
			getToken: () => {
				return new Promise((resolve, reject) => {
					const appCheckDto: AppCheckDto = {
						appId: environment.firebase.appId
					};

					this.apiService.post('/v1/authorization/app-check', appCheckDto).subscribe({
						next: (appCheckToken: AppCheckToken) => {
							resolve({
								...appCheckToken,
								expireTimeMillis: appCheckToken.expireTimeMillis * 1000
							});
						},
						error: (error: any) => console.error(error)
					});
				});
			}
		});
	}

	initializeAppCheck(): void {
		this.appCheck = initializeAppCheck(this.getApp(), {
			provider: this.getCustomProvider(),
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
