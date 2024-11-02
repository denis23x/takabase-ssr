/** @format */

export interface ModerationResult {
	id: string;
	model: string;
	results: ModerationResultItem[];
}

export interface ModerationResultItem {
	flagged: boolean;
	categories: ModerationResultCategories;
}

export interface ModerationResultCategories {
	['harassment']: boolean;
	['harassment/threatening']: boolean;
	['hate']: boolean;
	['hate/threatening']: boolean;
	['self-harm']: boolean;
	['self-harm/instructions']: boolean;
	['self-harm/intent']: boolean;
	['sexual']: boolean;
	['sexual/minors']: boolean;
	['violence']: boolean;
	['violence/graphic']: boolean;
}
