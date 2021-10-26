/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersProfileComponent } from './profile/profile.component';
import { UsersProfileResolverService } from './profile/profile-resolver.service';
import { UsersDetailComponent } from './detail/detail.component';
import { UsersDetailResolverService } from './detail/detail-resolver.service';
import { UsersSettingsComponent } from './settings/settings.component';
import { UsersSettingsResolverService } from './settings/settings-resolver.service';
import { UsersSettingsAccountComponent } from './settings/account/account.component';
import { UsersSettingsInterfaceComponent } from './settings/interface/interface.component';
import { UsersSettingsSecurityComponent } from './settings/security/security.component';
import { PostsDetailComponent } from '../post/detail/detail.component';
import { PostsDetailResolverService } from '../post/detail/detail-resolver.service';
import { CategoryComponent } from '../category/category.component';
import { CategoryCreateComponent } from '../category/create/create.component';
import { CategoryDeleteComponent } from '../category/delete/delete.component';
import { CategoryEditComponent } from '../category/edit/edit.component';
import { CategoryEditResolverService } from '../category/edit/edit-resolver.service';
import { AuthGuard } from '../auth/guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    component: UsersProfileComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: UsersProfileResolverService
    },
    children: [
      {
        path: 'category',
        component: CategoryComponent,
        children: [
          {
            path: '',
            redirectTo: 'create',
            pathMatch: 'full'
          },
          {
            path: 'create',
            component: CategoryCreateComponent
          },
          {
            path: ':id/edit',
            component: CategoryEditComponent,
            resolve: {
              data: CategoryEditResolverService
            }
          },
          {
            path: ':id/delete',
            component: CategoryDeleteComponent,
            resolve: {
              data: CategoryEditResolverService
            }
          }
        ]
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
