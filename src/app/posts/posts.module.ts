/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { PostsCreateComponent } from './create/create.component';
import { PostsDetailComponent } from './detail/detail.component';
import { PostsRoutingModule } from './posts-routing.module';
import { MarkdownService, MarkdownPluginService } from './core';
import { MarkdownComponent } from './shared';

@NgModule({
  imports: [SharedModule, PostsRoutingModule],
  declarations: [PostsCreateComponent, PostsDetailComponent, MarkdownComponent],
  providers: [MarkdownService, MarkdownPluginService]
})
export class PostsModule {}
