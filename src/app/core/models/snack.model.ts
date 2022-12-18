/** @format */

export interface Snack {
	uuid?: string;
	title: string | null;
	message: string;
	duration?: SnackDuration;
	progress?: SnackProgress;
	options?: SnackOptions;
}

export interface SnackDuration {
	timeout?: ReturnType<typeof setTimeout>;
	value: number;
}

export interface SnackProgress {
	interval?: ReturnType<typeof setInterval>;
	value: number;
}

export interface SnackOptions {
	classList?: string | string[];
}
