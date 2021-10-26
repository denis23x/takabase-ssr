/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { UserRoutingModule } from './user-routing.module';
import { UsersDetailComponent } from './detail/detail.component';
import { UsersProfileComponent } from './profile/profile.component';
import { UsersSettingsComponent } from './settings/settings.component';
import { UsersSettingsAccountComponent } from './settings/account/account.component';
import { UsersSettingsInterfaceComponent } from './settings/interface/interface.component';
import { UsersSettingsSecurityComponent } from './settings/security/security.component';

@NgModule({
  imports: [SharedModule, UserRoutingModule],
  declarations: [
    UsersDetailComponent,
    UsersProfileComponent,
    UsersSettingsComponent,
    UsersSettingsAccountComponent,
    UsersSettingsInterfaceComponent,
    UsersSettingsSecurityComponent
  ]
})
export class UserModule {}
