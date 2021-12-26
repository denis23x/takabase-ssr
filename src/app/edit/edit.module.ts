/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { EditRoutingModule } from './edit-routing.module';
import { EditComponent } from './edit.component';
import { CategoryModule } from '../category/category.module';

@NgModule({
  imports: [SharedModule, EditRoutingModule, CategoryModule],
  declarations: [EditComponent]
})
export class EditModule {}
