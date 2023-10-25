/** @format */

import { User } from './user.model';
import firebase from 'firebase/compat';

export interface CurrentUser extends User {
	bearer?: string;
	terms: boolean;
	firebase: firebase.User;
	// firebaseId?: string;
	// facebookId?: string;
	// githubId?: string;
	// googleId?: string;
}
