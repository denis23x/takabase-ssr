/** @format */

import type { UserInfo, User as FirebaseUser } from 'firebase/auth';

export interface CurrentUser extends FirebaseUser {}

export interface CurrentUserProviderData extends Partial<UserInfo> {
	providerLabel: string;
	providerIcon: string;
	providerIconClass?: string[];
	providerIconViewBox?: string;
	providerLink: string;
	linked: boolean;
}
