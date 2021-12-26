/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppAuthedDirective, AppScrollIntoViewDirective } from './directives';
import { DayjsPipe, MarkdownPipe, SanitizerPipe } from './pipes';
import {
  AvatarComponent,
  CardCategoryComponent,
  CardPostComponent,
  CardUserComponent,
  CategorySaveComponent,
  DropdownComponent,
  MarkdownComponent,
  OverlayComponent,
  PostDetailComponent,
  SvgIconComponent
} from './layout';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  declarations: [
    AppAuthedDirective,
    AppScrollIntoViewDirective,
    AvatarComponent,
    CardCategoryComponent,
    CardPostComponent,
    CardUserComponent,
    CategorySaveComponent,
    DropdownComponent,
    MarkdownComponent,
    OverlayComponent,
    PostDetailComponent,
    SvgIconComponent,
    DayjsPipe,
    MarkdownPipe,
    SanitizerPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppAuthedDirective,
    AppScrollIntoViewDirective,
    AvatarComponent,
    CardCategoryComponent,
    CardPostComponent,
    CardUserComponent,
    CategorySaveComponent,
    DropdownComponent,
    MarkdownComponent,
    OverlayComponent,
    PostDetailComponent,
    SvgIconComponent,
    DayjsPipe,
    MarkdownPipe,
    SanitizerPipe
  ]
})
export class SharedModule {}
