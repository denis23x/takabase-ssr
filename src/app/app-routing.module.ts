/** @format */

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, UrlSegment } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './auth/core';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canLoad: [NoAuthGuard]
  },
  {
    matcher: (url: UrlSegment[]) => {
      switch (url.length) {
        case 1:
          return url[0].path === 'create' ? { consumed: url } : null;
        case 2:
          return url[0].path === 'edit'
            ? {
                consumed: url.slice(0, 1),
                posParams: {
                  postId: new UrlSegment(url[1].path, {})
                }
              }
            : null;
        default:
          return null;
      }
    },
    loadChildren: () => import('./markdown/markdown.module').then(m => m.MarkdownModule),
    canLoad: [AuthGuard]
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
    canLoad: [AuthGuard]
  },
  {
    path: 'users',
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
