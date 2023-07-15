/** @format */

import { UserSettings } from '../../models/user.model';

export interface UserUpdateDto {
	name?: string;
	description?: string;
	avatar?: string;
	email?: string;
	password?: string;
	newEmail?: string;
	newPassword?: string;
	settings?: Partial<UserSettingsUpdateDto>;
}

export type UserSettingsUpdateDto = UserSettings;
