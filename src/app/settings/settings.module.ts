/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SettingsAccountComponent } from './account/account.component';
import { SettingsInterfaceComponent } from './interface/interface.component';
import { SettingsSecurityComponent } from './security/security.component';

@NgModule({
  imports: [SharedModule, SettingsRoutingModule],
  declarations: [
    SettingsComponent,
    SettingsAccountComponent,
    SettingsInterfaceComponent,
    SettingsSecurityComponent
  ]
})
export class SettingsModule {}
