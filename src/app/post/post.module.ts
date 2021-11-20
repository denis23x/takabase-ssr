/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './post.component';
import { MarkdownPipe } from './shared';

@NgModule({
  imports: [SharedModule, PostRoutingModule],
  declarations: [PostComponent, MarkdownPipe]
})
export class PostModule {}
