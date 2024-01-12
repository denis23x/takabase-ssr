/** @format */

import { Component, Input } from '@angular/core';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { Category } from '../../../../core/models/category.model';
import { UserUrlPipe } from '../../../pipes/user-url.pipe';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../../avatar/avatar.component';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';

@Component({
	standalone: true,
	imports: [RouterModule, SkeletonDirective, UserUrlPipe, AvatarComponent, DayjsPipe],
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
