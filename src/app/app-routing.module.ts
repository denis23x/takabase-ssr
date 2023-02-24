/** @format */

import { NgModule } from '@angular/core';
import {
	RouterModule,
	Routes,
	TitleStrategy,
	UrlSegment
} from '@angular/router';
import { SettingsResolverService } from './settings/settings-resolver.service';
import { CreateResolverService } from './create/create-resolver.service';
import { SearchPostResolverService } from './search/post/post-resolver.service';
import { SearchPostDetailResolverService } from './search/post/detail/detail-resolver.service';
import { SearchCategoryResolverService } from './search/category/category-resolver.service';
import { SearchUserResolverService } from './search/user/user-resolver.service';
import { UserResolverService } from './user/user-resolver.service';
import { UserPostResolverService } from './user/post/post-resolver.service';
import { UserPostDetailResolverService } from './user/post/detail/detail-resolver.service';
import { CanMatchPublicGuard } from './core/guards/public-guard.service';
import { CanMatchPrivateGuard } from './core/guards/private-guard.service';
import { TitleService } from './core/services/title.service';

const routes: Routes = [
	{
		path: '',
		title: 'Home',
		loadComponent: () => {
			return import('./home/home.component').then(m => m.HomeComponent);
		}
	},
	{
		path: 'login',
		loadComponent: () => {
			return import('./auth/auth.component').then(m => m.AuthComponent);
		},
		canMatch: [CanMatchPublicGuard],
		children: [
			{
				path: '',
				title: 'Login',
				// prettier-ignore
				loadComponent: () => {
          return import('./auth/login/login.component').then(m => m.AuthLoginComponent);
        }
			}
		]
	},
	{
		path: 'registration',
		loadComponent: () => {
			return import('./auth/auth.component').then(m => m.AuthComponent);
		},
		canMatch: [CanMatchPublicGuard],
		children: [
			{
				path: '',
				title: 'Registration',
				// prettier-ignore
				loadComponent: () => {
          return import('./auth/registration/registration.component').then(m => m.AuthRegistrationComponent);
        }
			}
		]
	},
	{
		path: 'reset',
		loadComponent: () => {
			return import('./auth/auth.component').then(m => m.AuthComponent);
		},
		canMatch: [CanMatchPublicGuard],
		children: [
			{
				path: '',
				title: 'Reset password',
				// prettier-ignore
				loadComponent: () => {
          return import('./auth/reset/reset.component').then(m => m.AuthResetComponent);
        }
			}
		]
	},
	{
		path: 'create',
		title: 'Create post',
		loadComponent: () => {
			return import('./create/create.component').then(m => m.CreateComponent);
		},
		resolve: {
			data: CreateResolverService
		},
		canMatch: [CanMatchPrivateGuard]
	},
	{
		path: 'edit/:postId',
		title: 'Edit post',
		loadComponent: () => {
			return import('./create/create.component').then(m => m.CreateComponent);
		},
		resolve: {
			data: CreateResolverService
		},
		canMatch: [CanMatchPrivateGuard]
	},
	{
		path: 'search',
		loadComponent: () => {
			return import('./search/search.component').then(m => m.SearchComponent);
		},
		children: [
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'posts'
			},
			{
				path: 'posts',
				title: 'Posts search',
				// prettier-ignore
				loadComponent: () => {
					return import('./search/post/post.component').then(m => m.SearchPostComponent);
				},
				resolve: {
					data: SearchPostResolverService
				},
				children: [
					{
						path: ':postId',
						// prettier-ignore
						loadComponent: () => {
              return import('./search/post/detail/detail.component').then(m => m.SearchPostDetailComponent);
            },
						resolve: {
							data: SearchPostDetailResolverService
						}
					}
				]
			},
			{
				path: 'categories',
				title: 'Categories search',
				// prettier-ignore
				loadComponent: () => {
          return import('./search/category/category.component').then(m => m.SearchCategoryComponent);
        },
				resolve: {
					data: SearchCategoryResolverService
				}
			},
			{
				path: 'users',
				title: 'Users search',
				// prettier-ignore
				loadComponent: () => {
          return import('./search/user/user.component').then(m => m.SearchUserComponent);
        },
				resolve: {
					data: SearchUserResolverService
				}
			}
		]
	},
	{
		path: 'settings',
		// prettier-ignore
		loadComponent: () => {
      return import('./settings/settings.component').then(m => m.SettingsComponent);
    },
		runGuardsAndResolvers: 'always',
		resolve: {
			data: SettingsResolverService
		},
		canMatch: [CanMatchPrivateGuard],
		children: [
			{
				path: '',
				redirectTo: 'profile',
				pathMatch: 'full'
			},
			{
				path: 'account',
				title: 'Account settings',
				// prettier-ignore
				loadComponent: () => {
          return import('./settings/account/account.component').then(m => m.SettingsAccountComponent);
        }
			},
			{
				path: 'appearance',
				title: 'Appearance settings',
				// prettier-ignore
				loadComponent: () => {
          return import('./settings/appearance/appearance.component').then(m => m.SettingsAppearanceComponent);
        }
			},
			{
				path: 'profile',
				title: 'Profile settings',
				// prettier-ignore
				loadComponent: () => {
          return import('./settings/profile/profile.component').then(m => m.SettingsProfileComponent);
        }
			},
			{
				path: 'security',
				title: 'Security settings',
				// prettier-ignore
				loadComponent: () => {
          return import('./settings/security/security.component').then(m => m.SettingsSecurityComponent);
        }
			}
		]
	},
	{
		matcher: (urlSegment: UrlSegment[]) => {
			if (urlSegment[0].path.match(/^@\S+$/gm)) {
				return {
					consumed: urlSegment.slice(0, 1)
				};
			}

			return null;
		},
		loadComponent: () => {
			return import('./user/user.component').then(m => m.UserComponent);
		},
		resolve: {
			data: UserResolverService
		},
		children: [
			{
				path: '',
				loadComponent: () => {
					// prettier-ignore
					return import('./user/post/post.component').then(m => m.UserPostComponent);
				},
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
						loadComponent: () => {
							// prettier-ignore
							return import('./user/post/detail/detail.component').then(m => m.UserPostDetailComponent);
						},
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
				loadComponent: () => {
					// prettier-ignore
					return import('./user/post/post.component').then(m => m.UserPostComponent);
				},
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
						loadComponent: () => {
							// prettier-ignore
							return import('./user/post/detail/detail.component').then(m => m.UserPostDetailComponent);
						},
						resolve: {
							data: UserPostDetailResolverService
						}
					}
				]
			}
		]
	},
	{
		path: 'error/:status',
		loadComponent: () => {
			// prettier-ignore
			return import('./error/error.component').then(m => m.ErrorComponent);
		}
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: '/error/404'
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			initialNavigation: 'enabledBlocking'
		})
	],
	exports: [RouterModule],
	providers: [
		{
			provide: TitleStrategy,
			useClass: TitleService
		}
	]
})
export class AppRoutingModule {}
