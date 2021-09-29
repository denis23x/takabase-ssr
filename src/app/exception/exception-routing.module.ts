/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExceptionComponent } from './exception.component';
import { ExceptionStatusComponent } from './status/status.component';

const routes: Routes = [
  {
    path: '',
    component: ExceptionComponent,
    children: [
      {
        path: ':status',
        component: ExceptionStatusComponent
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: '/exception/404'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExceptionRoutingModule {}
