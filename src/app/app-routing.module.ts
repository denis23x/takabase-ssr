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
		loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
	},
	{
		path: 'auth',
		loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
		canMatch: [CanMatchPublicGuard]
	},
	{
		matcher: (url: UrlSegment[]) => {
			const [path]: UrlSegment[] = url;

			// prettier-ignore
			return ['create', 'edit'].includes(path.path) ? { consumed: url.slice(0, 1) } : null;
		},
		// prettier-ignore
		loadChildren: () => import('./create/create.module').then(m => m.CreateModule),
		canMatch: [CanMatchPrivateGuard]
	},
	{
		path: 'exception',
		// prettier-ignore
		loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule)
	},
	{
		path: 'search',
		// prettier-ignore
		loadChildren: () => import('./search/search.module').then(m => m.SearchModule)
	},
	{
		path: 'settings',
		// prettier-ignore
		loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
		canMatch: [CanMatchPrivateGuard]
	},
	{
		matcher: (url: UrlSegment[]) => {
			const [path]: UrlSegment[] = url;

			// prettier-ignore
			return path.path.match(/^@[\w\.]+$/gm) ? { consumed: url.slice(0, 1) } : null;
		},
		loadChildren: () => import('./user/user.module').then(m => m.UserModule)
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
