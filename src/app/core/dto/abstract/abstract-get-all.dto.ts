/** @format */

import type { PostGetAllDto } from '../post/post-get-all.dto';
import type { CategoryGetAllDto } from '../category/category-get-all.dto';
import type { UserGetAllDto } from '../user/user-get-all.dto';

export interface AbstractGetAllDto extends PostGetAllDto, CategoryGetAllDto, UserGetAllDto {}
