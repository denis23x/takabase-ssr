/** @format */

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, UrlSegment } from '@angular/router';
import {
  CanLoadPublicGuard,
  CanLoadRestrictGuard,
  CanActivatePublicGuard,
  CanActivateRestrictGuard
} from './core';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canLoad: [CanLoadPublicGuard],
    canActivate: [CanActivatePublicGuard]
  },
  {
    matcher: (url: UrlSegment[]) => {
      return ['create', 'edit'].includes(url[0].path) ? { consumed: url.slice(0, 1) } : null;
    },
    loadChildren: () => import('./markdown/markdown.module').then(m => m.MarkdownModule),
    canLoad: [CanLoadRestrictGuard],
    canActivate: [CanActivateRestrictGuard]
  },
  {
    path: 'exception',
    loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
    canLoad: [CanLoadRestrictGuard],
    canActivate: [CanActivateRestrictGuard]
  },
  {
    matcher: (url: UrlSegment[]) => {
      return url[0].path.match(/^@[\w\.]+$/gm) ? { consumed: url.slice(0, 1) } : null;
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
      preloadingStrategy: PreloadAllModules
      // initialNavigation: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
