/** @format */

export interface ModerationCreateDto {
	model: string;
	input: (ModerationCreateTextDto | ModerationCreateImageDto)[];
}

export interface ModerationCreateTextDto {
	type: string;
	text: string;
}

export interface ModerationCreateImageDto {
	type: string;
	image_url: {
		url: string;
	};
}
