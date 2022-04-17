/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppAuthenticatedDirective, AppScrollIntoViewDirective } from './directives';
import { DayjsPipe, MarkdownPipe, SanitizerPipe } from './pipes';
import {
  AvatarComponent,
  CategoryCreateComponent,
  CategoryDetailComponent,
  CategoryDetailResolverService,
  CategoryEditComponent,
  PostCardComponent,
  PostCreateComponent,
  PostDetailComponent,
  PostDetailResolverService,
  DropdownComponent,
  MarkdownComponent,
  OverlayComponent,
  SvgIconComponent
} from './layout';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  declarations: [
    AppAuthenticatedDirective,
    AppScrollIntoViewDirective,
    AvatarComponent,
    CategoryCreateComponent,
    CategoryDetailComponent,
    CategoryEditComponent,
    PostCardComponent,
    PostCreateComponent,
    PostDetailComponent,
    DropdownComponent,
    MarkdownComponent,
    OverlayComponent,
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
    AppAuthenticatedDirective,
    AppScrollIntoViewDirective,
    AvatarComponent,
    CategoryCreateComponent,
    CategoryDetailComponent,
    CategoryEditComponent,
    PostCardComponent,
    PostCreateComponent,
    PostDetailComponent,
    DropdownComponent,
    MarkdownComponent,
    OverlayComponent,
    SvgIconComponent,
    DayjsPipe,
    MarkdownPipe,
    SanitizerPipe
  ],
  providers: [CategoryDetailResolverService, PostDetailResolverService]
})
export class SharedModule {}
