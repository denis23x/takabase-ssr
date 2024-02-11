/** @format */

export interface AIModerateImageDto {
	model: string;
	input: any;
}

export interface AIModerateImageResult {
	className: string;
	probability: number;
}
