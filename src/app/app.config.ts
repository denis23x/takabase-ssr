/** @format */

import { ApplicationConfig } from '@angular/core';
import {
	PreloadAllModules,
	provideRouter,
	TitleStrategy,
	withComponentInputBinding,
	withEnabledBlockingInitialNavigation,
	withPreloading,
	withRouterConfig
} from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { httpAppCheckInterceptor } from './core/interceptors/http.app-check.interceptor';
import { httpAuthorizationInterceptor } from './core/interceptors/http.authorization.interceptor';
import { TitleService } from './core/services/title.service';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(
			withFetch(),
			withInterceptors([httpAppCheckInterceptor, httpAuthorizationInterceptor])
		),
		provideClientHydration(),
		provideServiceWorker('ngsw-worker.js', {
			enabled: environment.pwa,
			registrationStrategy: 'registerWhenStable:30000'
		}),
		provideRouter(
			APP_ROUTES,
			withPreloading(PreloadAllModules),
			withEnabledBlockingInitialNavigation(),
			withComponentInputBinding(),
			withRouterConfig({
				onSameUrlNavigation: 'reload',
				paramsInheritanceStrategy: 'always'
			})
		),
		{
			provide: TitleStrategy,
			useClass: TitleService
		}
	]
};
