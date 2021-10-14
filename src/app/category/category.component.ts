/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html'
})
export class CategoryComponent {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  onClose(): void {
    this.router
      .navigate(['.'], {
        relativeTo: this.activatedRoute.parent,
        queryParamsHandling: 'preserve'
      })
      .then(() => console.debug('Route was changed'));
  }
}
