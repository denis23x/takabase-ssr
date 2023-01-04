/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SettingsAccountComponent } from './account/account.component';
import { SettingsAppearanceComponent } from './appearance/appearance.component';
import { SettingsProfileComponent } from './profile/profile.component';
import { SettingsSecurityComponent } from './security/security.component';

@NgModule({
	imports: [SharedModule, SettingsRoutingModule],
	declarations: [
		SettingsComponent,
		SettingsAccountComponent,
		SettingsAppearanceComponent,
		SettingsProfileComponent,
		SettingsSecurityComponent
	]
})
export class SettingsModule {}
