/** @format */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../../avatar/avatar.component';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import type { Category } from '../../../../core/models/category.model';

@Component({
	standalone: true,
	imports: [RouterModule, SkeletonDirective, AvatarComponent, SvgIconComponent],
	selector: 'app-card-category, [appCardCategory]',
	templateUrl: './category.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
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
