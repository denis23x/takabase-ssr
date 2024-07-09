/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../core/models/user.model';
import { Post } from '../core/models/post.model';
import { Category } from '../core/models/category.model';

@Injectable({
	providedIn: 'root'
})
export class PostStore {
	readonly user: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);
	readonly userList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

	readonly category: BehaviorSubject<Category | undefined> = new BehaviorSubject<Category | undefined>(undefined);
	readonly categoryList: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);

	readonly post: BehaviorSubject<Post | undefined> = new BehaviorSubject<Post | undefined>(undefined);
	readonly postList: BehaviorSubject<Post[]> = new BehaviorSubject<Post[]>([]);

	// User

	getUser(): Observable<User | undefined> {
		return this.user.asObservable();
	}

	setUser(user: User | undefined): void {
		this.user.next(user);
	}

	getUserList(): Observable<User[]> {
		return this.userList.asObservable();
	}

	setUserList(userList: User[]): void {
		this.userList.next(userList);
	}

	// Category

	getCategory(): Observable<Category | undefined> {
		return this.category.asObservable();
	}

	setCategory(category: Category | undefined): void {
		this.category.next(category);
	}

	getCategoryList(): Observable<Category[]> {
		return this.categoryList.asObservable();
	}

	setCategoryList(categoryList: Category[]): void {
		this.categoryList.next(categoryList);
	}

	// Post

	getPost(): Observable<Post | undefined> {
		return this.post.asObservable();
	}

	setPost(post: Post | undefined): void {
		this.post.next(post);
	}

	getPostList(): Observable<Post[]> {
		return this.postList.asObservable();
	}

	setPostList(postList: Post[]): void {
		this.postList.next(postList);
	}
}
