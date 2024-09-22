/** @format */

import { Injectable } from '@angular/core';
import { numbers } from 'nanoid-dictionary';
import { customAlphabet } from 'nanoid';
import { LoremIpsum } from 'lorem-ipsum';
import dayjs from 'dayjs/esm';
import type { User } from '../models/user.model';
import type { Post } from '../models/post.model';
import type { Category } from '../models/category.model';

@Injectable({
	providedIn: 'root'
})
export class SkeletonService {
	loremIpsum: LoremIpsum = new LoremIpsum({
		sentencesPerParagraph: {
			max: 8,
			min: 4
		},
		wordsPerSentence: {
			max: 16,
			min: 4
		}
	});

	getCategory(): Category {
		return {
			id: Number(customAlphabet(numbers, 8)()),
			name: this.loremIpsum.generateWords(2),
			description: this.loremIpsum.generateSentences(1),
			user: this.getUser(),
			posts: [],
			createdAt: dayjs().subtract(1, 'day').toISOString(),
			updatedAt: dayjs().subtract(1, 'day').toISOString()
		};
	}

	getCategoryList(): Category[] {
		return Array(10)
			.fill(null)
			.map(() => this.getCategory());
	}

	getPost(): Post {
		return {
			id: Number(customAlphabet(numbers, 8)()),
			name: this.loremIpsum.generateWords(2),
			description: this.loremIpsum.generateSentences(1),
			image: +customAlphabet('01', 1)() ? './assets/images/placeholder-image.svg' : null,
			category: this.getCategory(),
			user: this.getUser(),
			markdown: this.loremIpsum.generateSentences(5),
			createdAt: dayjs().subtract(1, 'day').toISOString(),
			updatedAt: dayjs().subtract(1, 'day').toISOString()
		};
	}

	getPostList(): Post[] {
		return Array(10)
			.fill(null)
			.map(() => this.getPost());
	}

	getUser(): User {
		return {
			id: Number(customAlphabet(numbers, 8)()),
			name: this.loremIpsum.generateWords(1),
			description: this.loremIpsum.generateWords(3),
			avatar: +customAlphabet('01', 1)() ? './assets/images/placeholder-image.svg' : null,
			categories: [],
			posts: [],
			createdAt: dayjs().subtract(1, 'day').toISOString(),
			updatedAt: dayjs().subtract(1, 'day').toISOString()
		};
	}

	getUserList(): User[] {
		return Array(10)
			.fill(null)
			.map(() => this.getUser());
	}

	getInsightList(): any {
		return [
			{
				id: 1,
				key: 'categories',
				value: 'Categories',
				countPreceding: 0,
				countFollowing: 0,
				changeState: 'stasis',
				changePercent: 0
			},
			{
				id: 2,
				key: 'posts',
				value: 'Posts',
				countPreceding: 0,
				countFollowing: 0,
				changeState: 'stasis',
				changePercent: 0
			},
			{
				id: 2,
				key: 'users',
				value: 'Users',
				countPreceding: 0,
				countFollowing: 0,
				changeState: 'stasis',
				changePercent: 0
			}
		];
	}
}
