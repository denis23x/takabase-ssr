/** @format */

import { User } from './user.model';
import { User as FirebaseUser } from 'firebase/auth';

export interface CurrentUser extends User {
	bearer?: string;
	terms: boolean;
	firebase: FirebaseUser;
}
