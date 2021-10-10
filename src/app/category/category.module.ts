/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CategoryCreateComponent } from './create/create.component';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryService } from './core';

@NgModule({
  imports: [SharedModule, CategoryRoutingModule],
  declarations: [CategoryCreateComponent],
  providers: [CategoryService]
})
export class CategoryModule {}
