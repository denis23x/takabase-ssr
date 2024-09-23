/** @format */

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	appUrl: 'http://localhost:4200',
	apiUrl: 'http://localhost:8080',
	ai: {
		url: 'https://takabase-local-ai.web.app'
	},
	sharp: {
		url: 'https://takabase-local-sharp.web.app'
	},
	mailer: {
		to: 'damage.23x@gmail.com',
		bcc: ['']
	},
	algolia: {
		appId: '9R4WFD8I42',
		apiKey: '8fefeb46b0e8c8f221343c3d55c7f07b'
	},
	pwa: false,
	production: false,
	firebase: {
		apiKey: 'AIzaSyBjYjnCQeQzGPePjsDqgU_EpOqRyF0YadM',
		authDomain: 'takabase-local.firebaseapp.com',
		projectId: 'takabase-local',
		storageBucket: 'takabase-local.appspot.com',
		messagingSenderId: '804966843833',
		appId: '1:804966843833:web:0fda27de913151deb36268'
	},
	themes: [
		'acid',
		'aqua',
		'autumn',
		'black',
		'bumblebee',
		'business',
		'cmyk',
		'coffee',
		'corporate',
		'cupcake',
		'cyberpunk',
		'dark',
		'dim',
		'dracula',
		'emerald',
		'fantasy',
		'forest',
		'garden',
		'halloween',
		'lemonade',
		'light',
		'lofi',
		'luxury',
		'night',
		'nord',
		'pastel',
		'retro',
		'sunset',
		'synthwave',
		'valentine',
		'winter',
		'wireframe'
	],
	backgrounds: [
		'beauty',
		'circus',
		'cosy-creatures',
		'dia-de-muertos',
		'gaming',
		'gastronomy',
		'gym',
		'medicine',
		'medieval',
		'movie',
		'ninja',
		'police',
		'spring',
		'summer'
	],
	prism: {
		themes: [
			'coy',
			'darcula',
			'default',
			'holi-theme',
			'night-owl',
			'okaidia',
			'one-dark',
			'one-light',
			'solarizedlight',
			'synthwave84',
			'tomorrow',
			'twilight',
			'vs'
		]
	},
	remoteConfig: {
		forbiddenUsername: [
			'post',
			'pwa',
			'error',
			'settings',
			'create',
			'update',
			'loading',
			'search',
			'profile',
			'confirmation',
			'login',
			'registration',
			'reset',
			'terms',
			'help',
			'post-covers',
			'post-images',
			'post-password-covers',
			'post-password-images',
			'post-private-covers',
			'post-private-images',
			'user-avatars',
			'seed',
			'temp'
		],
		appearance: {
			dropdownBackdrop: false,
			language: 'en-US',
			markdownMonospace: true,
			pageRedirectHome: false,
			pageScrollUp: false,
			pageScrollInfinite: false,
			theme: 'auto',
			themeBackground: 'cosy-creatures',
			themePrism: 'auto',
			windowButtonPosition: 'left'
		}
	}
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
