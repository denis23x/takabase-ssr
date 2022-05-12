/** @format */

import { NgModule } from '@angular/core';
import { UiComponent } from './ui.component';
import { SharedModule } from '../shared';
import { UiRoutingModule } from './ui-routing.module';

@NgModule({
  imports: [SharedModule, UiRoutingModule],
  declarations: [UiComponent]
})
export class UiModule {}
