/** @format */

export interface AIModerateTextDto {
	model: string;
	input: string | string[];
}

export interface AIModerateTextResult {
	id: string;
	model: string;
	results: AIModerateTextResultItem[];
}

export interface AIModerateTextResultItem {
	flagged: boolean;
	categories: AIModerateTextResultCategories;
	category_scores: AIModerateTextResultCategoriesScores;
}

export interface AIModerateTextResultCategories {
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
export interface AIModerateTextResultCategoriesScores {
	['harassment']: number;
	['harassment/threatening']: number;
	['hate']: number;
	['hate/threatening']: number;
	['self-harm']: number;
	['self-harm/instructions']: number;
	['self-harm/intent']: number;
	['sexual']: number;
	['sexual/minors']: number;
	['violence']: number;
	['violence/graphic']: number;
}
