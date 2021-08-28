/** @format */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppAuthedDirective } from './directives';
import { DayjsPipe, SanitizerPipe } from './pipes';
import {
  AvatarComponent,
  CardCategoryComponent,
  CardPostComponent,
  CardUserComponent,
  DropdownComponent,
  OverlayComponent,
  SvgIconComponent
} from './layout';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  declarations: [
    AppAuthedDirective,
    AvatarComponent,
    CardCategoryComponent,
    CardPostComponent,
    CardUserComponent,
    DropdownComponent,
    OverlayComponent,
    SvgIconComponent,
    DayjsPipe,
    SanitizerPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppAuthedDirective,
    AvatarComponent,
    CardCategoryComponent,
    CardPostComponent,
    CardUserComponent,
    DropdownComponent,
    OverlayComponent,
    SvgIconComponent,
    DayjsPipe,
    SanitizerPipe
  ]
})
export class SharedModule {}
