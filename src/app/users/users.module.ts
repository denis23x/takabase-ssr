/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { UsersDetailComponent } from './detail/detail.component';
import { UsersSettingsComponent } from './settings/settings.component';
import { UsersSettingsAccountComponent } from './settings/account/account.component';
import { UsersSettingsInterfaceComponent } from './settings/interface/interface.component';
import { UsersSettingsSecurityComponent } from './settings/security/security.component';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
  imports: [SharedModule, UsersRoutingModule],
  declarations: [
    UsersDetailComponent,
    UsersSettingsComponent,
    UsersSettingsAccountComponent,
    UsersSettingsInterfaceComponent,
    UsersSettingsSecurityComponent
  ]
})
export class UsersModule {}
