/** @format */

import { PostGetAllDto } from '../post/post-get-all.dto';
import { CategoryGetAllDto } from '../category/category-get-all.dto';
import { UserGetAllDto } from '../user/user-get-all.dto';

// prettier-ignore
export interface AbstractGetAllDto extends Partial<PostGetAllDto & CategoryGetAllDto & UserGetAllDto> {}
