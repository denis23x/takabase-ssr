/** @format */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { RouterModule } from '@angular/router';
import { UserAvatarComponent } from '../../user/avatar/avatar.component';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import type { Category } from '../../../../core/models/category.model';
import type { HighlightResult } from '@algolia/client-search';
import type { Post } from '../../../../core/models/post.model';

interface CategoryHighlightResult {
	_highlightResult: HighlightResult<Pick<Post, 'name' | 'description'>>;
}

@Component({
	standalone: true,
	imports: [RouterModule, CommonModule, SkeletonDirective, UserAvatarComponent, SvgIconComponent],
	selector: 'app-card-category, [appCardCategory]',
	templateUrl: './category.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardCategoryComponent {
	@Input({ required: true })
	set appCardCategoryCategory(category: Category & Partial<CategoryHighlightResult>) {
		this.category = category;
	}

	@Input()
	set appCardCategorySkeletonToggle(categorySkeletonToggle: boolean) {
		this.categorySkeletonToggle = categorySkeletonToggle;
	}

	category: (Category & Partial<CategoryHighlightResult>) | undefined;
	categorySkeletonToggle: boolean = true;
}
