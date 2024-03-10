/** @format */

import { inject, Injectable } from '@angular/core';
import { Post } from '../models/post.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';
import { HelperService } from './helper.service';

@Injectable({
	providedIn: 'root'
})
export class SkeletonService {
	private readonly helperService: HelperService = inject(HelperService);

	getCategory(scope: string[] = []): Category {
		return {
			id: 0,
			name: 'Jewelery',
			description: 'Dicta celebrer bis.',
			user: scope.includes('user') ? this.getUser() : undefined,
			posts: scope.includes('posts') ? this.getPostList() : [],
			createdAt: '2023-10-15T12:55:54.663Z',
			updatedAt: '2023-10-15T12:55:54.663Z'
		};
	}

	getCategoryList(scope: string[] = []): Category[] {
		return [
			{
				id: 0,
				name: 'Jewelery',
				description: 'Dicta celebrer bis.',
				user: scope.includes('user') ? this.getUser() : undefined,
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 0,
				name: 'Tools',
				description: 'Antepono deduco sonitus amplus vesper.',
				user: scope.includes('user') ? this.getUser() : undefined,
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 0,
				name: 'Baby',
				description: 'Timidus temeritas degero cresco complectus carus cursus ascit.',
				user: scope.includes('user') ? this.getUser() : undefined,
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 0,
				name: 'Computers',
				description: 'Vobis vulgaris curvo apparatus cuppedia capitulus.',
				user: scope.includes('user') ? this.getUser() : undefined,
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 0,
				name: 'Health',
				description: null,
				user: scope.includes('user') ? this.getUser() : undefined,
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			}
		];
	}

	getPost(scope: string[] = []): Post {
		return {
			id: 0,
			name: 'Paint it Black',
			firebaseUid: this.helperService.getNanoId(4),
			description: 'Synagoga absconditus depereo cedo.',
			image: null,
			category: scope.includes('category') ? this.getCategory() : undefined,
			user: scope.includes('user') ? this.getUser() : undefined,
			markdown: 'Quidem volutabrum artificiose blanditiis aeneus corrupti voluntarius comprehendo.',
			createdAt: '2023-10-15T12:55:54.955Z',
			updatedAt: '2023-10-15T12:55:54.955Z'
		};
	}

	getPostList(scope: string[] = []): Post[] {
		return [
			{
				id: 0,
				name: 'Paint it Black',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Synagoga absconditus depereo cedo id ulterius culpo adsum spectaculum umbra.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'You make Me Wanna',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Terminatio optio claustrum.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'Jailhouse Rock',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Compono adduco demitto curatio tabgo ipsum demo sto ubi.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'Can You Feel the Love Tonight',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Recusandae texo pauci terga compono.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'Make it With You',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Adversus stips allatus paulatim.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'Morning Train (Nine to Five)',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Super tardus approbo vorago vulgus angustus creta tremo subito approbo.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'Be My Baby',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Taceo vulgo confugo derideo.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'White Christmas',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Turpis nesciunt tendo ago urbanus.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'Wichita Lineman',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Speciosus casso eligendi facilis amiculum.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 0,
				name: 'Get Down Tonight',
				firebaseUid: this.helperService.getNanoId(4),
				description: 'Sonitus pax tabernus turba viriliter agnitio nulla arca.',
				image: null,
				category: scope.includes('category') ? this.getCategory() : undefined,
				user: scope.includes('user') ? this.getUser() : undefined,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			}
		];
	}

	getUser(scope: string[] = []): User {
		return {
			id: 0,
			name: 'Kayley75',
			description: 'Quidem volutabrum.',
			avatar: null,
			categories: scope.includes('categories') ? this.getCategoryList() : [],
			posts: scope.includes('posts') ? this.getPostList() : [],
			createdAt: '2023-10-16T13:47:47.360Z',
			updatedAt: '2023-10-16T13:47:47.360Z'
		};
	}

	getUserList(scope: string[] = []): User[] {
		return [
			{
				id: 0,
				name: 'Denis.23x',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-16T13:47:47.360Z',
				updatedAt: '2023-10-16T13:47:47.360Z'
			},
			{
				id: 0,
				name: 'Duncan.Doyle35',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 0,
				name: 'Tiara.Harvey',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 0,
				name: 'Alessia_Rath',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 0,
				name: 'Lambert_Wyman17',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 0,
				name: 'Scot_Shields7',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 0,
				name: 'Eino35',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 0,
				name: 'Kayley75',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 0,
				name: 'Lacey_OConner',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 0,
				name: 'Sarai88',
				description: null,
				avatar: null,
				categories: scope.includes('categories') ? this.getCategoryList() : [],
				posts: scope.includes('posts') ? this.getPostList() : [],
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			}
		];
	}
}
