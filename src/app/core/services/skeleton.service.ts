/** @format */

import { inject, Injectable } from '@angular/core';
import { HelperService } from './helper.service';
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
	private readonly helperService: HelperService = inject(HelperService);

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

	getCategory(scope: string[] = []): Category {
		return {
			id: Number(customAlphabet(numbers, 8)()),
			name: this.loremIpsum.generateWords(2),
			description: this.loremIpsum.generateSentences(1),
			user: scope.includes('user') ? this.getUser() : undefined,
			posts: scope.includes('posts') ? this.getPostList() : [],
			createdAt: dayjs().subtract(1, 'day').toISOString(),
			updatedAt: dayjs().subtract(1, 'day').toISOString()
		};
	}

	getCategoryList(scope: string[] = []): Category[] {
		return Array(10)
			.fill(null)
			.map(() => this.getCategory(scope));
	}

	getPost(scope: string[] = []): Post {
		return {
			id: Number(customAlphabet(numbers, 8)()),
			name: this.loremIpsum.generateWords(2),
			firebaseUid: this.helperService.getNanoId(4),
			description: this.loremIpsum.generateSentences(1),
			image: +customAlphabet('01', 1)() ? './assets/images/placeholder-image.svg' : null,
			category: scope.includes('category') ? this.getCategory() : undefined,
			user: scope.includes('user') ? this.getUser() : undefined,
			markdown: this.loremIpsum.generateSentences(5),
			createdAt: dayjs().subtract(1, 'day').toISOString(),
			updatedAt: dayjs().subtract(1, 'day').toISOString()
		};
	}

	getPostList(scope: string[] = []): Post[] {
		return Array(10)
			.fill(null)
			.map(() => this.getPost(scope));
	}

	getUser(scope: string[] = []): User {
		return {
			id: Number(customAlphabet(numbers, 8)()),
			name: this.loremIpsum.generateWords(1),
			description: this.loremIpsum.generateWords(3),
			avatar: +customAlphabet('01', 1)() ? './assets/images/placeholder-image.svg' : null,
			categories: scope.includes('categories') ? this.getCategoryList() : [],
			posts: scope.includes('posts') ? this.getPostList() : [],
			createdAt: dayjs().subtract(1, 'day').toISOString(),
			updatedAt: dayjs().subtract(1, 'day').toISOString()
		};
	}

	getUserList(scope: string[] = []): User[] {
		return Array(10)
			.fill(null)
			.map(() => this.getUser(scope));
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
