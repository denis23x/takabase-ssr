/** @format */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserResolverService } from './user-resolver.service';
import { UserPostDetailComponent } from './post/detail/detail.component';
import { UserPostDetailResolverService } from './post/detail/detail-resolver.service';
import { UserPostComponent } from './post/post.component';
import { UserPostResolverService } from './post/post-resolver.service';

const routes: Routes = [
	{
		path: '',
		component: UserComponent,
		resolve: {
			data: UserResolverService
		},
		children: [
			{
				path: '',
				component: UserPostComponent,
				resolve: {
					data: UserPostResolverService
				},
				children: [
					{
						path: 'post',
						redirectTo: '',
						pathMatch: 'full'
					},
					{
						path: 'post/:postId',
						component: UserPostDetailComponent,
						resolve: {
							data: UserPostDetailResolverService
						}
					}
				]
			},
			{
				path: 'category',
				redirectTo: '',
				pathMatch: 'full'
			},
			{
				path: 'category/:categoryId',
				component: UserPostComponent,
				resolve: {
					data: UserPostResolverService
				},
				children: [
					{
						path: 'post',
						redirectTo: '',
						pathMatch: 'full'
					},
					{
						path: 'post/:postId',
						component: UserPostDetailComponent,
						resolve: {
							data: UserPostDetailResolverService
						}
					}
				]
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UserRoutingModule {}
