/** @format */

import { Route, UrlMatchResult, UrlSegment } from '@angular/router';
import { redirectAuthGuard } from './core/guards/redirect-auth-guard.service';
import { redirectCurrentUserGuard } from './core/guards/redirect-current-user-guard.service';
import { redirectHomeGuard } from './core/guards/redirect-home-guard.service';
import { redirectHttpErrorGuard } from './core/guards/redirect-http-error-guard.service';
import { redirectLoadingGuard } from './core/guards/redirect-loading-guard.service';
import { redirectPasswordGuard } from './core/guards/redirect-password-guard.service';
import { redirectPrivateGuard } from './core/guards/redirect-private-guard.service';
import { redirectServerGuard } from './core/guards/redirect-server-guard.service';
import { environment } from '../environments/environment';
import { CookiesService } from './core/services/cookies.service';
import { inject } from '@angular/core';

// prettier-ignore
export const APP_ROUTES: Route[] = [
	{
		path: '',
		loadComponent: async () => {
			return import('./outlet/outlet.component').then(m => m.OutletComponent);
		},
		children: [
			{
				path: 'confirmation',
				title: 'Confirmation',
				loadComponent: async () => {
					return import('./authorization/confirmation/confirmation.component').then(m => m.AuthConfirmationComponent);
				},
				children: [
					{
						path: 'email',
						title: 'Email confirmation',
						loadComponent: async () => {
							return import('./authorization/confirmation/email/email.component').then(m => m.AuthConfirmationEmailComponent);
						}
					},
					{
						path: 'password',
						title: 'Set new password',
						loadComponent: async () => {
							return import('./authorization/confirmation/password/password.component').then(m => m.AuthConfirmationPasswordComponent);
						}
					},
					{
						path: 'recovery',
						title: 'Email recovery',
						loadComponent: async () => {
							return import('./authorization/confirmation/recovery/recovery.component').then(m => m.AuthConfirmationRecoveryComponent);
						}
					}
				]
			},
			{
				path: 'login',
				title: 'Login',
				canMatch: [redirectAuthGuard()],
				loadComponent: async () => {
					return import('./authorization/login/login.component').then(m => m.AuthLoginComponent);
				}
			},
			{
				path: 'registration',
				title: 'Registration',
				canMatch: [redirectAuthGuard()],
				loadComponent: async () => {
					return import('./authorization/registration/registration.component').then(m => m.AuthRegistrationComponent);
				}
			},
			{
				path: 'reset',
				title: 'Reset password',
				canMatch: [redirectAuthGuard()],
				loadComponent: async () => {
					return import('./authorization/reset/reset.component').then(m => m.AuthResetComponent);
				}
			},
			{
				path: 'terms',
				loadComponent: async () => {
					return import('./terms/terms.component').then(m => m.TermsComponent);
				},
				children: [
					{
						path: '',
						pathMatch: 'full',
						redirectTo: 'terms-of-service'
					},
					{
						path: ':details',
						title: 'Terms',
						loadComponent: async () => {
							return import('./terms/details/details.component').then(m => m.TermsDetailsComponent);
						}
					}
				]
			},
			{
				path: 'help',
				loadComponent: async () => {
					return import('./help/help.component').then(m => m.HelpComponent);
				},
				children: [
					{
						path: '',
						pathMatch: 'full',
						redirectTo: 'about'
					},
					{
						path: 'markdown',
						title: 'Markdown',
						loadComponent: async () => {
							return import('./help/markdown/markdown.component').then(m => m.HelpMarkdownComponent);
						}
					},
					{
						path: ':details',
						title: 'Help',
						loadComponent: async () => {
							return import('./help/details/details.component').then(m => m.HelpDetailsComponent);
						}
					}
				]
			},
			{
				path: 'create',
				title: 'Create post',
				canMatch: [redirectCurrentUserGuard()],
				loadComponent: async () => {
					return import('./create/create.component').then(m => m.CreateComponent);
				}
			},
			{
				path: 'update/:postId',
				title: 'Update post',
				canMatch: [redirectCurrentUserGuard()],
				loadComponent: async () => {
					return import('./create/create.component').then(m => m.CreateComponent);
				}
			},
			{
				path: 'search',
				loadComponent: async () => {
					return import('./search/search.component').then(m => m.SearchComponent);
				},
				children: [
					{
						path: '',
						pathMatch: 'full',
						redirectTo: () => {
							const cookiesService: CookiesService = inject(CookiesService);
							const cookiesSearchRedirect: string = cookiesService.getItem("page-redirect-search");

							return cookiesSearchRedirect || 'posts';
						}
					},
					{
						path: 'posts',
						title: 'Posts search',
						loadComponent: async () => {
							return import('./search/post/post.component').then(m => m.SearchPostComponent);
						}
					},
					{
						path: 'categories',
						title: 'Categories search',
						loadComponent: async () => {
							return import('./search/category/category.component').then(m => m.SearchCategoryComponent);
						}
					},
					{
						path: 'users',
						title: 'Users search',
						loadComponent: async () => {
							return import('./search/user/user.component').then(m => m.SearchUserComponent);
						}
					}
				]
			},
			{
				path: 'settings',
				canMatch: [redirectCurrentUserGuard()],
				loadComponent: async () => {
					return import('./settings/settings.component').then(m => m.SettingsComponent);
				},
				children: [
					{
						path: '',
						redirectTo: 'profile',
						pathMatch: 'full'
					},
					{
						path: 'account',
						title: 'Account settings',
						loadComponent: async () => {
							return import('./settings/account/account.component').then(m => m.SettingsAccountComponent);
						}
					},
					{
						path: 'appearance',
						title: 'Appearance settings',
						loadComponent: async () => {
							return import('./settings/appearance/appearance.component').then(m => m.SettingsAppearanceComponent);
						}
					},
					{
						path: 'profile',
						title: 'Profile settings',
						loadComponent: async () => {
							return import('./settings/profile/profile.component').then(m => m.SettingsProfileComponent);
						}
					}
				]
			},
			{
				path: 'post',
				loadComponent: async () => {
					return import('./post/post.component').then(m => m.PostComponent);
				},
				children: [
					{
						path: 'password',
						pathMatch: 'full',
						redirectTo: '/error/404'
					},
					{
						path: 'password/:postPasswordId',
						canMatch: [redirectServerGuard()],
						loadComponent: async () => {
							return import('./post/password/password.component').then(m => m.PostPasswordComponent);
						}
					},
					{
						path: 'private',
						pathMatch: 'full',
						redirectTo: '/error/404'
					},
					{
						path: 'private/:postPrivateId',
						canMatch: [redirectCurrentUserGuard()],
						loadComponent: async () => {
							return import('./post/private/private.component').then(m => m.PostPrivateComponent);
						}
					},
					{
						path: '',
						pathMatch: 'full',
						redirectTo: '/error/404'
					},
					{
						path: ':postId',
						canActivate: [redirectHttpErrorGuard()],
						loadComponent: async () => {
							return import('./post/all/all.component').then(m => m.PostAllComponent);
						}
					}
				]
			},
			{
				matcher: (urlSegment: UrlSegment[]): UrlMatchResult | null => {
					// Check if there is at least one URL segment
					if (urlSegment.length !== 0) {
						const username: string = urlSegment[0].path;
						const usernameForbiddenList: string[] = environment.remoteConfig.forbiddenUsername;

						// Check if the first URL segment matches the pattern for a username (e.g., denis23x)
						if (usernameForbiddenList.every((usernameForbidden: string) => username !== usernameForbidden)) {
							if (username.match(/(?![0-9]+$).*/i)) {
								const isCategory = (): boolean => (urlSegment.length === 3 && urlSegment[1].path === 'category') || urlSegment.length === 4;

								/** Switch */

								switch (true) {
									case isCategory(): {
										return {
											consumed: urlSegment.slice(0, 1),
											posParams: {
												username: new UrlSegment(username, null),
												categoryId: new UrlSegment(urlSegment[2].path, null),
											}
										}
									}
									default: {
										return {
											consumed: urlSegment.slice(0, 1),
											posParams: {
												username: new UrlSegment(username, null),
											}
										}
									}
								}
							}
						}
					}

					return null;
				},
				canActivate: [redirectHttpErrorGuard()],
				loadComponent: async () => {
					return import('./user/user.component').then(m => m.UserComponent);
				},
				children: [
					{
						path: '',
						loadComponent: async () => {
							return import('./user/all/all.component').then(m => m.UserAllComponent);
						}
					},
					{
						path: 'bookmark',
						canActivate: [redirectPasswordGuard()],
						loadComponent: async () => {
							return import('./user/bookmark/bookmark.component').then(m => m.UserBookmarkComponent);
						}
					},
					{
						path: 'password',
						canActivate: [redirectPasswordGuard()],
						loadComponent: async () => {
							return import('./user/password/password.component').then(m => m.UserPasswordComponent);
						}
					},
					{
						path: 'private',
						canActivate: [redirectPrivateGuard()],
						loadComponent: async () => {
							return import('./user/private/private.component').then(m => m.UserPrivateComponent);
						}
					},
					{
						path: 'category/:categoryId',
						loadComponent: async () => {
							return import('./user/category/category.component').then(m => m.UserCategoryComponent);
						}
					}
				]
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
				canMatch: [redirectHomeGuard()],
				loadComponent: async () => {
					return import('./home/home.component').then(m => m.HomeComponent);
				}
			},
		]
	},
	{
		path: 'error/:status',
		loadComponent: async () => {
			return import('./error/error.component').then(m => m.ErrorComponent);
		}
	},
	{
		path: 'loading',
		title: 'Loading',
		canMatch: [redirectLoadingGuard()],
		loadComponent: async () => {
			return import('./loading/loading.component').then(m => m.LoadingComponent);
		}
	},
	{
		path: 'pwa',
		title: 'Loading',
		loadComponent: async () => {
			return import('./pwa/pwa.component').then(m => m.PwaComponent);
		}
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: '/error/404'
	}
];
