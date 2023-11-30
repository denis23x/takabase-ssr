/** @format */

import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy, UrlMatchResult, UrlSegment } from '@angular/router';
import { TitleService } from './core/services/title.service';
import { redirectCurrentUserGuard } from './core/guards/redirect-current-user-guard.service';
import { redirectHomeGuard } from './core/guards/redirect-home-guard.service';

export const routes: Routes = [
	{
		path: 'confirmation',
		title: 'Confirmation',
		loadComponent: () => {
			// prettier-ignore
			return import('./authorization/confirmation/confirmation.component').then(m => m.AuthConfirmationComponent);
		},
		children: [
			{
				path: 'email',
				title: 'Email confirmation',
				loadComponent: () => {
					// prettier-ignore
					return import('./authorization/confirmation/email/email.component').then(m => m.AuthConfirmationEmailComponent);
				}
			},
			{
				path: 'password',
				title: 'Set password',
				loadComponent: () => {
					// prettier-ignore
					return import('./authorization/confirmation/password/password.component').then(m => m.AuthConfirmationPasswordComponent);
				}
			},
			{
				path: 'recovery',
				title: 'Email recovery',
				loadComponent: () => {
					// prettier-ignore
					return import('./authorization/confirmation/recovery/recovery.component').then(m => m.AuthConfirmationRecoveryComponent);
				}
			}
		]
	},
	{
		path: 'login',
		title: 'Login',
		loadComponent: () => {
			return import('./authorization/login/login.component').then(m => m.AuthLoginComponent);
		},
		canMatch: [redirectCurrentUserGuard(false)]
	},
	{
		path: 'registration',
		title: 'Registration',
		loadComponent: () => {
			// prettier-ignore
			return import('./authorization/registration/registration.component').then(m => m.AuthRegistrationComponent);
		},
		canMatch: [redirectCurrentUserGuard(false)]
	},
	{
		path: 'reset',
		title: 'Reset password',
		loadComponent: () => {
			return import('./authorization/reset/reset.component').then(m => m.AuthResetComponent);
		},
		canMatch: [redirectCurrentUserGuard(false)]
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
				loadComponent: () => {
					return import('./terms/details/details.component').then(m => m.TermsDetailsComponent);
				}
			}
		]
	},
	{
		path: 'help',
		pathMatch: 'full',
		redirectTo: 'help/about'
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
				loadComponent: () => {
					return import('./help/details/details.component').then(m => m.HelpDetailsComponent);
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
		canMatch: [redirectCurrentUserGuard(true)]
	},
	{
		path: 'update/:postId',
		title: 'Update post',
		loadComponent: () => {
			return import('./create/create.component').then(m => m.CreateComponent);
		},
		canMatch: [redirectCurrentUserGuard(true)]
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
				loadComponent: () => {
					return import('./search/post/post.component').then(m => m.SearchPostComponent);
				},
				children: [
					{
						path: ':postId',
						loadComponent: () => {
							// prettier-ignore
							return import('./search/post/details/details.component').then(m => m.SearchPostDetailsComponent);
						}
					}
				]
			},
			{
				path: 'categories',
				title: 'Categories search',
				loadComponent: () => {
					// prettier-ignore
					return import('./search/category/category.component').then(m => m.SearchCategoryComponent);
				}
			},
			{
				path: 'users',
				title: 'Users search',
				loadComponent: () => {
					return import('./search/user/user.component').then(m => m.SearchUserComponent);
				}
			}
		]
	},
	{
		path: 'settings',
		loadComponent: () => {
			return import('./settings/settings.component').then(m => m.SettingsComponent);
		},
		canMatch: [redirectCurrentUserGuard(true)],
		children: [
			{
				path: '',
				redirectTo: 'profile',
				pathMatch: 'full'
			},
			{
				path: 'account',
				title: 'Account settings',
				loadComponent: () => {
					// prettier-ignore
					return import('./settings/account/account.component').then(m => m.SettingsAccountComponent);
				}
			},
			{
				path: 'appearance',
				title: 'Appearance settings',
				loadComponent: () => {
					// prettier-ignore
					return import('./settings/appearance/appearance.component').then(m => m.SettingsAppearanceComponent);
				}
			},
			{
				path: 'profile',
				title: 'Profile settings',
				loadComponent: () => {
					// prettier-ignore
					return import('./settings/profile/profile.component').then(m => m.SettingsProfileComponent);
				}
			}
		]
	},
	{
		path: 'error/:status',
		loadComponent: () => {
			return import('./error/error.component').then(m => m.ErrorComponent);
		}
	},
	{
		path: 'loader',
		loadComponent: () => {
			return import('./loader/loader.component').then(m => m.LoaderComponent);
		}
	},
	{
		matcher: (urlSegment: UrlSegment[]): UrlMatchResult | null => {
			if (urlSegment.length === 0) {
				return {
					consumed: urlSegment
				};
			}

			return null;
		},
		title: 'Home',
		canMatch: [redirectHomeGuard()],
		loadComponent: () => {
			return import('./home/home.component').then(m => m.HomeComponent);
		}
	},
	{
		matcher: (urlSegment: UrlSegment[]): UrlMatchResult | null => {
			if (urlSegment.length >= 1 && urlSegment[0].path.match(/^@\S+$/gm)) {
				return {
					consumed: urlSegment.slice(0, 1),
					posParams: {
						name: new UrlSegment(urlSegment[0].path, {})
					}
				};
			}

			return null;
		},
		title: 'Profile',
		loadComponent: () => {
			return import('./user/user.component').then(m => m.UserComponent);
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
					return import('./user/post/post.component').then(m => m.UserPostComponent);
				},
				children: [
					{
						path: 'post/:postId',
						loadComponent: () => {
							// prettier-ignore
							return import('./user/post/details/details.component').then(m => m.UserPostDetailsComponent);
						}
					}
				]
			}
		]
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
			anchorScrolling: 'disabled',
			scrollPositionRestoration: 'disabled',
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
