/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLoginComponent } from './login/login.component';
import { AuthRegistrationComponent } from './registration/registration.component';
import { AuthResetComponent } from './reset/reset.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: AuthLoginComponent
  },
  {
    path: 'registration',
    component: AuthRegistrationComponent
  },
  {
    path: 'reset',
    component: AuthResetComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
