/** @format */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared';
import { MarkdownRoutingModule } from './markdown-routing.module';
import { MarkdownComponent } from './markdown.component';

@NgModule({
  imports: [SharedModule, MarkdownRoutingModule],
  declarations: [MarkdownComponent]
})
export class MarkdownModule {}
