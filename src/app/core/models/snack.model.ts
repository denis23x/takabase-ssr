/** @format */

export interface Snack {
	id: string;
	timestamp: number;
	title: string | null;
	message: string;
	progress?: SnackProgress;
	options?: SnackOptions;
}

export interface SnackProgress {
	interval: ReturnType<typeof setInterval>;
	value: number;
}

export interface SnackOptions {
	icon?: string;
	progress?: boolean;
	duration?: number;
	alertClassList?: string | string[];
	progressClassList?: string | string[];
}
