/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Category } from '../../../../category/core';

@Component({
  selector: 'app-card-category, [appCardCategory]',
  templateUrl: './category.component.html'
})
export class CardCategoryComponent implements OnInit, OnDestroy {
  @Input()
  set appCategory(category: Category) {
    this.category = category;
  }

  constructor() {}

  category: Category;

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
