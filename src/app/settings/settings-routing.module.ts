/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { SettingsResolverService } from './settings-resolver.service';
import { SettingsAccountComponent } from './account/account.component';
import { SettingsInterfaceComponent } from './interface/interface.component';
import { SettingsSecurityComponent } from './security/security.component';
import { AuthGuard } from '../auth/guards';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: SettingsResolverService
    },
    children: [
      {
        path: '',
        redirectTo: 'account',
        pathMatch: 'full'
      },
      {
        path: 'account',
        component: SettingsAccountComponent
      },
      {
        path: 'interface',
        component: SettingsInterfaceComponent
      },
      {
        path: 'security',
        component: SettingsSecurityComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}
