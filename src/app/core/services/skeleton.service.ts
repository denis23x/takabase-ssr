/** @format */

import { Injectable } from '@angular/core';
import { Post } from '../models/post.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';
import { faker } from '@faker-js/faker';

@Injectable({
	providedIn: 'root'
})
export class SkeletonService {
	getCategory(): Category {
		return {
			id: faker.number.int(100),
			name: faker.commerce.department(),
			description: faker.datatype.boolean() ? faker.lorem.sentence() : null,
			user: this.getUser(),
			createdAt: faker.date.past().toString(),
			updatedAt: faker.date.recent().toString()
		};
	}

	getCategoryList(size: number): Category[] {
		const categoryList: Category[] = [];

		for (let i: number = 0; i < size; i++) {
			categoryList.push(this.getCategory());
		}

		return categoryList;
	}

	getPost(): Post {
		const image: string = 'https://placehold.co/256x256';

		return {
			id: faker.number.int(100),
			name: faker.music.songName(),
			description: faker.lorem.sentence(),
			markdown: faker.lorem.paragraphs(10),
			image: faker.datatype.boolean() ? image : null,
			createdAt: faker.date.past().toString(),
			updatedAt: faker.date.recent().toString()
		};
	}

	getPostList(size: number): Post[] {
		const postList: Post[] = [];

		for (let i: number = 0; i < size; i++) {
			postList.push(this.getPost());
		}

		return postList;
	}

	getUser(): User {
		const avatar: string = 'https://placehold.co/256x256';

		return {
			id: faker.number.int(100),
			name: faker.internet.userName(),
			description: faker.datatype.boolean() ? faker.person.jobTitle() : null,
			avatar: faker.datatype.boolean() ? avatar : null,
			terms: true,
			createdAt: faker.date.past().toString(),
			updatedAt: faker.date.recent().toString()
		};
	}

	getUserList(size: number): User[] {
		const userList: User[] = [];

		for (let i: number = 0; i < size; i++) {
			userList.push(this.getUser());
		}

		return userList;
	}
}
