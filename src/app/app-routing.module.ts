/** @format */

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  // {
  //   path: 'users',
  //   loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
  // },
  // {
  //   path: 'posts',
  //   loadChildren: () => import('./posts/posts.module').then(m => m.PostsModule)
  // },
  // {
  //   path: 'search',
  //   loadChildren: () => import('./search/search.module').then(m => m.SearchModule)
  // },
  {
    path: '**',
    redirectTo: '/'
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
