/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthLoginComponent } from './login/login.component';
import { AuthRegistrationComponent } from './registration/registration.component';
import { AuthResetComponent } from './reset/reset.component';

@NgModule({
	imports: [SharedModule, AuthRoutingModule],
	declarations: [
		AuthLoginComponent,
		AuthRegistrationComponent,
		AuthResetComponent
	]
})
export class AuthModule {}
