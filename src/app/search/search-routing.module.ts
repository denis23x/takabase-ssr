/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search.component';
import { SearchCategoryComponent } from './category/category.component';
import { SearchCategoryResolverService } from './category/category-resolver.service';
import { SearchPostComponent } from './post/post.component';
import { SearchPostResolverService } from './post/post-resolver.service';
import { SearchUserComponent } from './user/user.component';
import { SearchUserResolverService } from './user/user-resolver.service';
import { PostDetailComponent, PostDetailResolverService } from '../shared';

const routes: Routes = [
	{
		path: '',
		component: SearchComponent,
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'posts'
			},
			{
				path: 'posts',
				component: SearchPostComponent,
				resolve: {
					data: SearchPostResolverService
				},
				children: [
					{
						path: ':postId',
						component: PostDetailComponent,
						resolve: {
							data: PostDetailResolverService
						}
					}
				]
			},
			{
				path: 'categories',
				component: SearchCategoryComponent,
				resolve: {
					data: SearchCategoryResolverService
				}
			},
			{
				path: 'users',
				component: SearchUserComponent,
				resolve: {
					data: SearchUserResolverService
				}
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SearchRoutingModule {}
