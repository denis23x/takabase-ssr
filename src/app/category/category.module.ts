/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CategoryCreateComponent } from './create/create.component';
import { CategoryRoutingModule } from './category-routing.module';

@NgModule({
  imports: [SharedModule, CategoryRoutingModule],
  declarations: [CategoryCreateComponent]
})
export class CategoryModule {}
