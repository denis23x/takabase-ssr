/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { UsersDetailComponent } from './detail/detail.component';
import { UsersSettingsComponent } from './settings/settings.component';
import { UsersSettingsAccountComponent } from './settings/account/account.component';
import { UsersSettingsInterfaceComponent } from './settings/interface/interface.component';
import { UsersSettingsSecurityComponent } from './settings/security/security.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  imports: [SharedModule, UserRoutingModule],
  declarations: [
    UsersDetailComponent,
    UsersSettingsComponent,
    UsersSettingsAccountComponent,
    UsersSettingsInterfaceComponent,
    UsersSettingsSecurityComponent
  ]
})
export class UserModule {}
