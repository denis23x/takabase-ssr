/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, CategoryExtras } from '../../core';

@Component({
  selector: 'app-category-create-view',
  templateUrl: './create-view.component.html'
})
export class CategoryCreateViewComponent {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  onClose(category?: Category | void): void {
    let categoryExtras: CategoryExtras = {
      relativeTo: this.activatedRoute
    };

    if (category) {
      categoryExtras = {
        ...categoryExtras,
        state: {
          message: 'categoryCreated',
          category
        }
      };
    }

    this.router.navigate(['..'], categoryExtras).then(() => console.debug('Route changed'));
  }
}
