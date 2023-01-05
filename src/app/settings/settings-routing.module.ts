/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { SettingsResolverService } from './settings-resolver.service';
import { SettingsAccountComponent } from './account/account.component';
import { SettingsAppearanceComponent } from './appearance/appearance.component';
import { SettingsProfileComponent } from './profile/profile.component';
import { SettingsSecurityComponent } from './security/security.component';

const routes: Routes = [
	{
		path: '',
		component: SettingsComponent,
		runGuardsAndResolvers: 'always',
		resolve: {
			data: SettingsResolverService
		},
		children: [
			{
				path: '',
				redirectTo: 'profile',
				pathMatch: 'full'
			},
			{
				path: 'account',
				component: SettingsAccountComponent
			},
			{
				path: 'appearance',
				component: SettingsAppearanceComponent
			},
			{
				path: 'profile',
				component: SettingsProfileComponent
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
