/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './post.component';
import { PostHandlerComponent } from './handler/handler.component';

@NgModule({
  imports: [SharedModule, PostRoutingModule],
  declarations: [PostComponent, PostHandlerComponent],
  exports: [PostComponent, PostHandlerComponent]
})
export class PostModule {}
