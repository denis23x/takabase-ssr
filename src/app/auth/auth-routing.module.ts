/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLoginComponent } from './login/login.component';
import { AuthRegistrationComponent } from './registration/registration.component';
import { AuthResetComponent } from './reset/reset.component';
import { NoAuthGuard } from './no-auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: AuthLoginComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'registration',
    component: AuthRegistrationComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'reset',
    component: AuthResetComponent,
    canActivate: [NoAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
