/** @format */

import { Component, Input } from '@angular/core';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { Category } from '../../../../core/models/category.model';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';

@Component({
	standalone: true,
	imports: [RouterModule, SkeletonDirective, DayjsPipe],
	selector: 'app-card-category, [appCardCategory]',
	templateUrl: './category.component.html'
})
export class CardCategoryComponent {
	@Input({ required: true })
	set appCardCategoryCategory(category: Category) {
		this.category = category;
	}

	@Input()
	set appCardCategorySkeletonToggle(categorySkeletonToggle: boolean) {
		this.categorySkeletonToggle = categorySkeletonToggle;
	}

	category: Category | undefined;
	categorySkeletonToggle: boolean = true;
}
