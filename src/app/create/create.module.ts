/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { CreateRoutingModule } from './create-routing.module';
import { CreateComponent } from './create.component';
import { MarkdownComponent, MarkdownPipe, PostComponent } from './shared';

@NgModule({
  imports: [SharedModule, CreateRoutingModule],
  declarations: [CreateComponent, MarkdownComponent, MarkdownPipe, PostComponent]
})
export class CreateModule {}
