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
import { ReportComponent } from './standalone/components/report/report.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule.withServerTransition({ appId: 'serverApp' }),
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			// enabled: environment.pwa,
			enabled: false,
			registrationStrategy: 'registerWhenStable:30000'
		}),
		provideFirebaseApp(() => initializeApp()),
		provideStorage(() => getStorage()),
		provideFirestore(() => getFirestore()),
		HttpClientModule,
		HeaderComponent,
		SnackbarComponent,
		ScrollToTopComponent,
		ReportComponent
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpAuthInterceptor,
			multi: true
		},
		{
			provide: FIREBASE_OPTIONS,
			useValue: environment.firebase
		}
	],
	bootstrap: [AppComponent]
})
export class AppConfigurationModule {}
