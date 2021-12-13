/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CreateRoutingModule } from './create-routing.module';
import { CreateComponent } from './create.component';
import { CategoryModule } from '../category/category.module';
import { PostModule } from '../post/post.module';

@NgModule({
  imports: [SharedModule, CreateRoutingModule, CategoryModule, PostModule],
  declarations: [CreateComponent]
})
export class CreateModule {}
