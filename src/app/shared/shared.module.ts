/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {
  AvatarComponent,
  CategoryCreateComponent,
  CategoryDetailComponent,
  CategoryEditComponent,
  DropdownComponent,
  HeaderComponent,
  MarkdownComponent,
  OverlayComponent,
  PostCardComponent,
  PostCreateComponent,
  PostDetailComponent,
  ShareComponent,
  SnackbarComponent,
  SvgIconComponent
} from './components';
import { AppAuthenticatedDirective, AppScrollIntoViewDirective } from './directives';
import { DayjsPipe, MarkdownPipe, SanitizerPipe } from './pipes';

const components: any[] = [
  AvatarComponent,
  CategoryCreateComponent,
  CategoryDetailComponent,
  CategoryEditComponent,
  DropdownComponent,
  HeaderComponent,
  MarkdownComponent,
  OverlayComponent,
  PostCardComponent,
  PostCreateComponent,
  PostDetailComponent,
  ShareComponent,
  SnackbarComponent,
  SvgIconComponent
];

const directives: any[] = [AppAuthenticatedDirective, AppScrollIntoViewDirective];
const pipes: any[] = [DayjsPipe, MarkdownPipe, SanitizerPipe];

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule, ReactiveFormsModule, RouterModule],
  declarations: [...components, ...directives, ...pipes],
  exports: [
    ...components,
    ...directives,
    ...pipes,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class SharedModule {}
