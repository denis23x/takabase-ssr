/** @format */

import { NgModule } from '@angular/core';
import {
	RouterModule,
	Routes,
	TitleStrategy,
	UrlSegment
} from '@angular/router';
import { CreateResolverService } from './create/create-resolver.service';
import { SearchPostResolverService } from './search/post/post-resolver.service';
import { SearchPostDetailsResolverService } from './search/post/details/details-resolver.service';
import { SearchCategoryResolverService } from './search/category/category-resolver.service';
import { SearchUserResolverService } from './search/user/user-resolver.service';
import { SettingsResolverService } from './settings/settings-resolver.service';
import { SettingsAppearanceResolverService } from './settings/appearance/appearance-resolver.service';
import { UserResolverService } from './user/user-resolver.service';
import { UserPostResolverService } from './user/post/post-resolver.service';
import { UserPostDetailsResolverService } from './user/post/details/details-resolver.service';
import { CanMatchPublicGuard } from './core/guards/public-guard.service';
import { CanMatchPrivateGuard } from './core/guards/private-guard.service';
import { TermsDetailsResolverService } from './terms/details/details-resolver.service';
import { HelpDetailsResolverService } from './help/details/details-resolver.service';
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
		path: 'email/confirmation',
		title: 'Email confirmation',
		// prettier-ignore
		loadComponent: () => {
      return import('./auth/email-confirmation/email-confirmation.component').then(m => m.AuthEmailConfirmationComponent);
    }
	},
	{
		path: 'login',
		title: 'Login',
		// prettier-ignore
		loadComponent: () => {
      return import('./auth/login/login.component').then(m => m.AuthLoginComponent);
    },
		canMatch: [CanMatchPublicGuard]
	},
	{
		path: 'registration',
		title: 'Registration',
		// prettier-ignore
		loadComponent: () => {
      return import('./auth/registration/registration.component').then(m => m.AuthRegistrationComponent);
    },
		canMatch: [CanMatchPublicGuard]
	},
	{
		path: 'reset',
		title: 'Reset password',
		// prettier-ignore
		loadComponent: () => {
      return import('./auth/reset/reset.component').then(m => m.AuthResetComponent);
    },
		canMatch: [CanMatchPublicGuard]
	},
	{
		path: 'reset/password',
		title: 'Set password',
		// prettier-ignore
		loadComponent: () => {
      return import('./auth/reset-password/reset-password.component').then(m => m.AuthResetPasswordComponent);
    },
		canMatch: [CanMatchPublicGuard]
	},
	{
		path: 'terms',
		pathMatch: 'full',
		redirectTo: 'terms/terms-of-use'
	},
	{
		path: 'terms/:markdown',
		loadComponent: () => {
			return import('./terms/terms.component').then(m => m.TermsComponent);
		},
		children: [
			{
				path: '',
				title: 'Terms',
				// prettier-ignore
				loadComponent: () => {
          return import('./terms/details/details.component').then(m => m.TermsDetailsComponent);
        },
				resolve: {
					data: TermsDetailsResolverService
				}
			}
		]
	},
	{
		path: 'help',
		pathMatch: 'full',
		redirectTo: 'help/features'
	},
	{
		path: 'help/:markdown',
		loadComponent: () => {
			return import('./help/help.component').then(m => m.HelpComponent);
		},
		children: [
			{
				path: '',
				title: 'Help',
				// prettier-ignore
				loadComponent: () => {
		      return import('./help/details/details.component').then(m => m.HelpDetailsComponent);
		    },
				resolve: {
					data: HelpDetailsResolverService
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
              return import('./search/post/details/details.component').then(m => m.SearchPostDetailsComponent);
            },
						resolve: {
							data: SearchPostDetailsResolverService
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
        },
				resolve: {
					data: SettingsAppearanceResolverService
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
			if (urlSegment.length >= 1 && urlSegment[0].path.match(/^@\S+$/gm)) {
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
				path: 'post',
				redirectTo: '',
				pathMatch: 'full'
			},
			{
				path: 'category',
				redirectTo: '',
				pathMatch: 'full'
			},
			{
				path: 'category/:categoryId/post',
				redirectTo: 'category/:categoryId',
				pathMatch: 'full'
			},
			{
				matcher: (urlSegment: UrlSegment[]) => {
					if (urlSegment.length === 0) {
						return {
							consumed: urlSegment
						};
					}

					if (urlSegment.length === 2) {
						if (urlSegment[0].path === 'post') {
							return {
								consumed: [],
								posParams: {
									postId: new UrlSegment(urlSegment[1].path, {})
								}
							};
						}

						if (urlSegment[0].path === 'category') {
							return {
								consumed: urlSegment.slice(0),
								posParams: {
									categoryId: new UrlSegment(urlSegment[1].path, {})
								}
							};
						}
					}

					// prettier-ignore
					if (urlSegment.length === 4 && urlSegment[0].path === 'category' && urlSegment[2].path === 'post') {
						return {
							consumed: urlSegment.slice(0, 2),
							posParams: {
								categoryId: new UrlSegment(urlSegment[1].path, {}),
								postId: new UrlSegment(urlSegment[3].path, {})
							}
						};
					}

					return null;
				},
				loadComponent: () => {
					// prettier-ignore
					return import('./user/post/post.component').then(m => m.UserPostComponent);
				},
				runGuardsAndResolvers: 'pathParamsChange',
				resolve: {
					data: UserPostResolverService
				},
				children: [
					{
						path: 'post/:postId',
						loadComponent: () => {
							// prettier-ignore
							return import('./user/post/details/details.component').then(m => m.UserPostDetailsComponent);
						},
						resolve: {
							data: UserPostDetailsResolverService
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
