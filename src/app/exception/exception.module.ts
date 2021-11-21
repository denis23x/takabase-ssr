/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { ExceptionRoutingModule } from './exception-routing.module';
import { ExceptionComponent } from './exception.component';

@NgModule({
  imports: [SharedModule, ExceptionRoutingModule],
  declarations: [ExceptionComponent]
})
export class ExceptionModule {}
