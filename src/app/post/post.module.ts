/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './post.component';
import { PostCreateViewComponent } from './create/post-view.component';
import { PostCreateComponent } from './shared';

@NgModule({
  imports: [SharedModule, PostRoutingModule],
  declarations: [PostComponent, PostCreateViewComponent, PostCreateComponent],
  exports: [PostComponent, PostCreateViewComponent, PostCreateComponent]
})
export class PostModule {}
