/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CreateRoutingModule } from './create-routing.module';
import { CreateComponent } from './create.component';

@NgModule({
	imports: [SharedModule, CreateRoutingModule],
	declarations: [CreateComponent]
})
export class CreateModule {}
