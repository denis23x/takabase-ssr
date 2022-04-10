/** @format */

import { Category } from './category.model';
import { Session } from './session.model';
import { Post } from './post.model';

export interface User {
  id: number;
  name: string;
  biography: string | null;
  posts?: Post[];
  categories?: Category[];
  avatar: string | null;
  email?: string;
  sessions: Session[];
  accessToken?: string;
  settings?: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: UserSettingsTheme;
}

enum UserSettingsTheme {
  AUTO = 'AUTO',
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}
