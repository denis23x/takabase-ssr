/** @format */

import type { User } from './user.model';
import type { UserInfo, User as FirebaseUser } from 'firebase/auth';

export interface CurrentUser extends User {
	bearer?: string;
	terms: boolean;
	firebase: FirebaseUser;
}

export interface CurrentUserProviderData extends Partial<UserInfo> {
	providerLabel: string;
	providerIcon: string;
	providerIconClass?: string;
	providerIconViewBox?: string;
	providerLink: string;
	linked: boolean;
}
