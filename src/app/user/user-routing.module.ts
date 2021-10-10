/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersDetailComponent } from './detail/detail.component';
import { UsersDetailResolverService } from './detail/detail-resolver.service';
import { UsersSettingsComponent } from './settings/settings.component';
import { UsersSettingsResolverService } from './settings/settings-resolver.service';
import { UsersSettingsAccountComponent } from './settings/account/account.component';
import { UsersSettingsInterfaceComponent } from './settings/interface/interface.component';
import { UsersSettingsSecurityComponent } from './settings/security/security.component';
import { PostsDetailComponent } from '../post/detail/detail.component';
import { PostsDetailResolverService } from '../post/detail/detail-resolver.service';
import { CategoryCreateComponent } from '../category/create/create.component';
import { AuthGuard } from '../auth/guards';

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
        path: 'category/create',
        component: CategoryCreateComponent
      },
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
    resolve: {
      data: UsersSettingsResolverService
    },
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
      },
      {
        path: 'security',
        component: UsersSettingsSecurityComponent
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
export class UserRoutingModule {}
