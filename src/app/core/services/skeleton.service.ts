/** @format */

import { Injectable } from '@angular/core';
import { Post } from '../models/post.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';

@Injectable({
	providedIn: 'root'
})
export class SkeletonService {
	getCategory(): Category {
		return {
			id: 146,
			name: 'Jewelery',
			description: 'Dicta celebrer bis.',
			createdAt: '2023-10-15T12:55:54.663Z',
			updatedAt: '2023-10-15T12:55:54.663Z'
		};
	}

	getCategoryList(): Category[] {
		return [
			{
				id: 146,
				name: 'Jewelery',
				description: 'Dicta celebrer bis.',
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 143,
				name: 'Tools',
				description: 'Antepono deduco sonitus amplus vesper.',
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 139,
				name: 'Baby',
				description: 'Timidus temeritas degero cresco complectus carus cursus ascit.',
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 103,
				name: 'Computers',
				description: 'Vobis vulgaris curvo apparatus cuppedia capitulus.',
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 94,
				name: 'Health',
				description: null,
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 73,
				name: 'Electronics',
				description: null,
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 48,
				name: 'Sports',
				description: null,
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 19,
				name: 'Industrial',
				description: null,
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 5,
				name: 'Music',
				description: 'Vix neque uter deorsum textilis corrupti colo.',
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			},
			{
				id: 2,
				name: 'Toys',
				description: 'Cursus cernuus crur bellicus thymum delectatio fuga similique tum quaerat.',
				createdAt: '2023-10-15T12:55:54.663Z',
				updatedAt: '2023-10-15T12:55:54.663Z'
			}
		].map((category: Category) => ({
			...category,
			user: this.getUser()
		}));
	}

	getPost(): Post {
		return {
			id: 1574,
			name: 'Paint it Black',
			description: 'Synagoga absconditus depereo cedo id ulterius culpo adsum spectaculum umbra.',
			image: null,
			createdAt: '2023-10-15T12:55:54.955Z',
			updatedAt: '2023-10-15T12:55:54.955Z'
		};
	}

	getPostList(): Post[] {
		return [
			{
				id: 1574,
				name: 'Paint it Black',
				description: 'Synagoga absconditus depereo cedo id ulterius culpo adsum spectaculum umbra.',
				image: null,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1573,
				name: 'You make Me Wanna',
				description: 'Terminatio optio claustrum.',
				image: null,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1572,
				name: 'Jailhouse Rock',
				description: 'Compono adduco demitto curatio tabgo ipsum demo sto ubi.',
				image: null,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1571,
				name: 'Can You Feel the Love Tonight',
				description: 'Recusandae texo pauci terga compono.',
				image: 'http://0.0.0.0:4400/upload/images/seed/21.webp?alt=media',
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1570,
				name: 'Make it With You',
				description: 'Adversus stips allatus paulatim.',
				image: null,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1569,
				name: 'Morning Train (Nine to Five)',
				description: 'Super tardus approbo vorago vulgus angustus creta tremo subito approbo.',
				image: null,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1568,
				name: 'Be My Baby',
				description: 'Taceo vulgo confugo derideo.',
				image: null,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1567,
				name: 'White Christmas',
				description: 'Turpis nesciunt tendo ago urbanus.',
				image: null,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1566,
				name: 'Wichita Lineman',
				description: 'Speciosus casso eligendi facilis amiculum.',
				image: 'http://0.0.0.0:4400/upload/images/seed/36.webp?alt=media',
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			},
			{
				id: 1565,
				name: 'Get Down Tonight',
				description: 'Sonitus pax tabernus turba viriliter agnitio nulla arca.',
				image: null,
				createdAt: '2023-10-15T12:55:54.955Z',
				updatedAt: '2023-10-15T12:55:54.955Z'
			}
		];
	}

	getUser(): User {
		return {
			id: 21,
			name: 'aaaaaDenis666',
			description: null,
			avatar: null,
			createdAt: '2023-10-16T13:47:47.360Z',
			updatedAt: '2023-10-16T13:47:47.360Z'
		};
	}

	getUserList(): User[] {
		return [
			{
				id: 21,
				name: 'aaaaaDenis666',
				description: null,
				avatar: null,
				createdAt: '2023-10-16T13:47:47.360Z',
				updatedAt: '2023-10-16T13:47:47.360Z'
			},
			{
				id: 20,
				name: 'Duncan.Doyle35',
				description: null,
				avatar: null,
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 19,
				name: 'Tiara.Harvey',
				description: null,
				avatar: null,
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 18,
				name: 'Alessia_Rath',
				description: null,
				avatar: 'http://0.0.0.0:4400/upload/images/seed/107.webp?alt=media',
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 17,
				name: 'Lambert_Wyman17',
				description: 'Dynamic Mobility Technician',
				avatar: null,
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 16,
				name: 'Scot_Shields7',
				description: null,
				avatar: null,
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 15,
				name: 'Eino35',
				description: null,
				avatar: null,
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 14,
				name: 'Kayley75',
				description: null,
				avatar: 'http://0.0.0.0:4400/upload/images/seed/49.webp?alt=media',
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 13,
				name: 'Lacey_OConner',
				description: null,
				avatar: null,
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			},
			{
				id: 12,
				name: 'Sarai88',
				description: 'District Directives Specialist',
				avatar: 'http://0.0.0.0:4400/upload/images/seed/103.webp?alt=media',
				createdAt: '2023-10-15T12:55:54.635Z',
				updatedAt: '2023-10-15T12:55:54.635Z'
			}
		];
	}
}
