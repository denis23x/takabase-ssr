/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CreateRoutingModule } from './create-routing.module';
import { CreateComponent } from './create.component';
import { MarkdownComponent } from './shared';
import { PostModule } from '../post/post.module';
import { CategoryModule } from '../category/category.module';

@NgModule({
  imports: [SharedModule, CreateRoutingModule, PostModule, CategoryModule],
  declarations: [CreateComponent, MarkdownComponent]
})
export class CreateModule {}
