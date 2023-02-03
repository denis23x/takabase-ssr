/** @format */

import { NgModule } from '@angular/core';
import {
	PreloadAllModules,
	RouterModule,
	Routes,
	UrlSegment
} from '@angular/router';
import { CanMatchPrivateGuard, CanMatchPublicGuard } from './core';

const routes: Routes = [
	{
		path: '',
		loadChildren: () => {
			return import('./home/home.module').then(m => m.HomeModule);
		}
	},
	{
		path: 'auth',
		loadChildren: () => {
			return import('./auth/auth.module').then(m => m.AuthModule);
		},
		canMatch: [CanMatchPublicGuard]
	},
	{
		matcher: (urlSegment: UrlSegment[]) => {
			if (urlSegment.length === 1) {
				if (urlSegment[0].path === 'create') {
					return {
						consumed: urlSegment.slice(0, 1)
					};
				}
			}

			if (urlSegment.length === 2) {
				if (urlSegment[0].path === 'edit' && !!Number(urlSegment[1].path)) {
					return {
						consumed: urlSegment.slice(0, 1)
					};
				}
			}

			return null;
		},
		loadChildren: () => {
			return import('./create/create.module').then(m => m.CreateModule);
		},
		canMatch: [CanMatchPrivateGuard]
	},
	{
		path: 'exception',
		loadChildren: () => {
			// prettier-ignore
			return import('./exception/exception.module').then(m => m.ExceptionModule);
		}
	},
	{
		path: 'search',
		loadChildren: () => {
			return import('./search/search.module').then(m => m.SearchModule);
		}
	},
	{
		path: 'settings',
		loadChildren: () => {
			return import('./settings/settings.module').then(m => m.SettingsModule);
		},
		canMatch: [CanMatchPrivateGuard]
	},
	{
		matcher: (urlSegment: UrlSegment[]) => {
			if (urlSegment[0].path.match(/^@\S+$/gm)) {
				return {
					consumed: urlSegment.slice(0, 1)
				};
			}

			return null;
		},
		loadChildren: () => {
			return import('./user/user.module').then(m => m.UserModule);
		}
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: '/exception/404'
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			preloadingStrategy: PreloadAllModules,
			initialNavigation: 'enabledBlocking'
		})
	],
	exports: [RouterModule]
})
export class AppRoutingModule {}
