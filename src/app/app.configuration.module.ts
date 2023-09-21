/** @format */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './standalone/components/header/header.component';
import { SnackbarComponent } from './standalone/components/snackbar/snackbar.component';
import { HttpAuthInterceptor } from './core/interceptors/http.auth.interceptor';
import { ScrollToTopComponent } from './standalone/components/scroll-to-top/scroll-to-top.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule.withServerTransition({ appId: 'serverApp' }),
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.pwa,
			registrationStrategy: 'registerWhenStable:30000'
		}),
		provideFirebaseApp(() =>
			initializeApp({
				apiKey: environment.firebase.apiKey,
				authDomain: environment.firebase.authDomain,
				projectId: environment.firebase.projectId,
				storageBucket: environment.firebase.storageBucket,
				messagingSenderId: environment.firebase.messagingSenderId,
				appId: environment.firebase.appId,
				measurementId: environment.firebase.measurementId
			})
		),
		HttpClientModule,
		HeaderComponent,
		SnackbarComponent,
		ScrollToTopComponent
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpAuthInterceptor,
			multi: true
		}
	],
	bootstrap: [AppComponent]
})
export class AppConfigurationModule {}
