/** @format */

import type { Appearance } from '../../models/appearance.model';

export interface UserCreateDto {
	name: string;
	email: string;
	password: string;
	terms: boolean;
	appearance?: Appearance;
}
