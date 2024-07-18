/** @format */

export const environment = {
	appUrl: 'https://takabase-dev.web.app',
	apiUrl: 'https://takabase-dev-api.web.app/api',
	ai: {
		url: 'https://takabase-dev-ai.web.app/api'
	},
	sharp: {
		url: 'https://takabase-dev-sharp.web.app/api'
	},
	mailer: {
		to: 'damage.23x@gmail.com',
		bcc: ['']
	},
	algolia: {
		appId: 'SOTX1SV4EX',
		apiKey: '3c1ca68cc62bf3a5ac9286ee939402c5'
	},
	pwa: true,
	production: true,
	firebase: {
		apiKey: 'AIzaSyDxntkbYprxdDjuF39gCD6TUBKaMac5XqM',
		authDomain: 'takabase-dev.firebaseapp.com',
		projectId: 'takabase-dev',
		storageBucket: 'takabase-dev.appspot.com',
		messagingSenderId: '154893506373',
		appId: '1:154893506373:web:2319353415e6129a6b902c'
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
			'help'
		],
		appearance: {
			dropdownBackdrop: false,
			language: 'en-US',
			markdownMonospace: true,
			pageRedirectHome: false,
			pageScrollToTop: false,
			pageScrollInfinite: false,
			theme: 'auto',
			themeBackground: 'cosy-creatures',
			themePrism: 'auto',
			windowButtonPosition: 'left'
		}
	}
};
