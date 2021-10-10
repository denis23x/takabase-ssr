/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { PostsCreateComponent } from './create/create.component';
import { PostsDetailComponent } from './detail/detail.component';
import { PostRoutingModule } from './post-routing.module';
import { MarkdownService, MarkdownPluginService } from './core';
import { MarkdownComponent } from './shared';

@NgModule({
  imports: [SharedModule, PostRoutingModule],
  declarations: [PostsCreateComponent, PostsDetailComponent, MarkdownComponent],
  providers: [MarkdownService, MarkdownPluginService]
})
export class PostModule {}
