/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Category } from '../../core';

@Component({
  selector: 'app-category-create-view',
  templateUrl: './create-view.component.html'
})
export class CategoryCreateViewComponent {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  onClose(category?: Category | void): void {
    let navigationExtras: NavigationExtras = {
      relativeTo: this.activatedRoute
    };

    if (category) {
      navigationExtras = {
        ...navigationExtras,
        state: {
          message: 'categoryCreated',
          data: category
        }
      };
    }

    this.router.navigate(['../'], navigationExtras).then(() => console.debug('Route changed'));
  }
}
