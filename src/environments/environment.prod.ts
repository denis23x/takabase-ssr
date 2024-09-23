/** @format */

export const environment = {
	appUrl: 'https://takabase.com',
	apiUrl: 'https://api.takabase.com',
	ai: {
		url: 'https://ai.takabase.com'
	},
	sharp: {
		url: 'https://sharp.takabase.com'
	},
	mailer: {
		to: 'damage.23x@gmail.com',
		bcc: ['']
	},
	algolia: {
		appId: 'HOGBJRS60N',
		apiKey: '55331aeb9ebe423032247ace53a2f62d'
	},
	pwa: true,
	production: true,
	firebase: {
		apiKey: 'AIzaSyAXXH474qF96wRTRu-t2tvt40UstCIHRp0',
		authDomain: 'takabase-prod.firebaseapp.com',
		projectId: 'takabase-prod',
		storageBucket: 'takabase-prod.appspot.com',
		messagingSenderId: '125232720401',
		appId: '1:125232720401:web:d8fa2325fba147d0e35fb0'
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
