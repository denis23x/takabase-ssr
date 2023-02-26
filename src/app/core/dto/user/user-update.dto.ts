/** @format */

import { UserSettings } from '../../models/user.model';

export interface UserUpdateDto {
	name?: string;
	description?: string;
	avatar?: string;
	email?: string;
	settings?: Partial<UserSettingsUpdateDto>;
}

export interface UserSettingsUpdateDto extends UserSettings {}
