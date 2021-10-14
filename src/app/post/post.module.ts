/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { PostRoutingModule } from './post-routing.module';
import { PostsCreateComponent } from './create/create.component';
import { PostsDetailComponent } from './detail/detail.component';
import { MarkdownComponent } from './shared';

@NgModule({
  imports: [SharedModule, PostRoutingModule],
  declarations: [PostsCreateComponent, PostsDetailComponent, MarkdownComponent]
})
export class PostModule {}
