/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { PostsCreateComponent } from './create/create.component';
import { PostsDetailComponent } from './detail/detail.component';
import { PostRoutingModule } from './post-routing.module';
import { MarkdownComponent } from './shared';
import { MarkdownService, MarkdownPluginService, PostService } from './core';

@NgModule({
  imports: [SharedModule, PostRoutingModule],
  declarations: [PostsCreateComponent, PostsDetailComponent, MarkdownComponent],
  providers: [MarkdownService, MarkdownPluginService, PostService]
})
export class PostModule {}
