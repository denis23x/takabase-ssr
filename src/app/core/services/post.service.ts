/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { PostGetAllDto } from '../dto/post/post-get-all.dto';
import { Post } from '../models/post.model';
import { MetaOpenGraph, MetaTwitter } from '../models/meta.model';
import { PostCreateDto } from '../dto/post/post-create.dto';
import { PostGetOneDto } from '../dto/post/post-get-one.dto';
import { PostUpdateDto } from '../dto/post/post-update.dto';
import { MetaService } from './meta.service';
import { TitleService } from './title.service';
import {
	addDoc,
	collection,
	CollectionReference,
	doc,
	DocumentReference,
	DocumentSnapshot,
	getDoc,
	updateDoc
} from 'firebase/firestore';
import { catchError, map } from 'rxjs/operators';
import { FirebaseError } from 'firebase/app';
import { FirebaseService } from './firebase.service';
import { CurrentUser } from '../models/current-user.model';
import { AuthorizationService } from './authorization.service';
import { PostCreateDocumentDto } from '../dto/post/post-create-document.dto';
import { PostUpdateDocumentDto } from '../dto/post/post-update-document.dto';

@Injectable({
	providedIn: 'root'
})
export class PostService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly userService: UserService = inject(UserService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);

	backupPostMetaOpenGraph: MetaOpenGraph;
	backupPostMetaTwitter: MetaTwitter;

	backupPostTitle: string;

	/** Firestore */

	// prettier-ignore
	createDocument(postCreateDocumentDto: PostCreateDocumentDto = {}): Observable<string> {
		const currentUser: CurrentUser | undefined = this.authorizationService.currentUser.getValue();

		const postCollectionPath: string = '/users/' + currentUser.firebase.uid + '/posts';
		const postCollection: CollectionReference = collection(this.firebaseService.getFirestore(), postCollectionPath);

		return from(addDoc(postCollection, postCreateDocumentDto)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			map((documentReference: DocumentReference) => documentReference.id)
		);
	}

	// prettier-ignore
	getOneDocument(firebaseId: string): Observable<any> {
		const currentUser: CurrentUser | undefined = this.authorizationService.currentUser.getValue();

		const postCollectionPath: string = '/users/' + currentUser.firebase.uid + '/posts';
		const postCollection: CollectionReference = collection(this.firebaseService.getFirestore(), postCollectionPath);
		const postDoc: DocumentReference = doc(postCollection, firebaseId);

		return from(getDoc(postDoc)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			map((documentSnapshot: DocumentSnapshot) => documentSnapshot.data())
		);
	}

	// prettier-ignore
	updateDocument(firebaseId: string, postUpdateDocumentDto: PostUpdateDocumentDto): Observable<string> {
		const currentUser: CurrentUser | undefined = this.authorizationService.currentUser.getValue();

		const postCollectionPath: string = '/users/' + currentUser.firebase.uid + '/posts';
		const postCollection: CollectionReference = collection(this.firebaseService.getFirestore(), postCollectionPath);
		const postDoc: DocumentReference = doc(postCollection, firebaseId);

		return from(updateDoc(postDoc, { ...postUpdateDocumentDto })).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			map(() => firebaseId)
		);
	}

	/** SEO Meta tags */

	setPostMetaTags(post: Post): void {
		this.backupPostMetaOpenGraph = this.metaService.getMetaOpenGraph();
		this.backupPostMetaTwitter = this.metaService.getMetaTwitter();

		/** Set new meta */

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: post.name,
			['og:description']: post.description,
			['og:type']: 'article',
			['article:published_time']: post.createdAt,
			['article:modified_time']: post.updatedAt,
			['article:author']: this.userService.getUserUrl(post.user, 1),
			['article:section']: post.category.name,
			['og:image']: post.image,
			['og:image:alt']: post.name,
			['og:image:type']: 'image/png'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: post.name,
			['twitter:description']: post.description,
			['twitter:image']: post.image,
			['twitter:image:alt']: post.name
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}

	removePostMeta(): void {
		this.metaService.setMeta(this.backupPostMetaOpenGraph, this.backupPostMetaTwitter);
	}

	/** SEO Title */

	setPostTitle(title: string): void {
		this.backupPostTitle = this.titleService.getTitle();

		this.titleService.setTitle(title);
	}

	removePostTitle(): void {
		this.titleService.setTitle(this.backupPostTitle);
	}

	/** REST */

	create(postCreateDto: PostCreateDto): Observable<Post> {
		return this.apiService.post('/posts', postCreateDto);
	}

	getAll(postGetAllDto: PostGetAllDto): Observable<Post[]> {
		return this.apiService.get('/posts', postGetAllDto);
	}

	getOne(id: number, postGetOneDto: PostGetOneDto): Observable<Post> {
		return this.apiService.get('/posts/' + id, postGetOneDto);
	}

	update(id: number, postUpdateDto: PostUpdateDto): Observable<Post> {
		return this.apiService.put('/posts/' + id, postUpdateDto);
	}

	delete(id: number): Observable<Post> {
		return this.apiService.delete('/posts/' + id);
	}
}
