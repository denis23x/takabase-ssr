/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersDetailComponent } from './detail/detail.component';
import { UsersDetailResolverService } from './detail/detail-resolver.service';
import { UsersSettingsComponent } from './settings/settings.component';
import { UsersSettingsAccountComponent } from './settings/account/account.component';
import { UsersSettingsInterfaceComponent } from './settings/interface/interface.component';
import { AuthGuard } from '../core';
import { PostsDetailComponent } from '../posts/detail/detail.component';
import { PostsDetailResolverService } from '../posts/detail/detail-resolver.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    component: UsersDetailComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: UsersDetailResolverService
    },
    data: {
      isProfile: true
    },
    children: [
      {
        path: 'posts/:id',
        component: PostsDetailComponent,
        resolve: {
          data: PostsDetailResolverService
        }
      }
    ]
  },
  {
    path: 'settings',
    component: UsersSettingsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'account',
        pathMatch: 'full'
      },
      {
        path: 'account',
        component: UsersSettingsAccountComponent
      },
      {
        path: 'interface',
        component: UsersSettingsInterfaceComponent
      }
    ]
  },
  {
    path: ':id',
    component: UsersDetailComponent,
    resolve: {
      data: UsersDetailResolverService
    },
    children: [
      {
        path: 'posts/:id',
        component: PostsDetailComponent,
        resolve: {
          data: PostsDetailResolverService
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}
