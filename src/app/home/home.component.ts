/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { SvgIconComponent } from '../shared/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../shared/components/post/card/card.component';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../shared/pipes/markdown.pipe';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SanitizerPipe } from '../shared/pipes/sanitizer.pipe';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		SvgIconComponent,
		CommonModule,
		PostCardComponent,
		FormsModule,
		MarkdownPipe,
		SanitizerPipe
	],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	post: any = {
		category: {
			createdAt: '2023-02-27T12:46:24.419Z',
			description: 'Culpa nemo at enim possimus in.',
			id: 1661,
			name: 'Toys',
			updatedAt: '2023-02-27T12:46:24.419Z'
		},
		createdAt: '2023-02-27T12:46:24.694Z',
		description: 'Minus vero consequatur rem dolor ea eum veritatis.',
		id: 15615,
		image: 'http://localhost:3323/images/135.jpg',
		markdown:
			'Hic voluptatum debitis quasi ad rerum itaque dicta vel molestiae. Earum quia enim ad. Quisquam dolores et. Atque ab quidem quae. Quod facilis sapiente eum recusandae rerum.\nDucimus commodi nobis cupiditate libero dolorem recusandae maxime. Sapiente officia possimus reprehenderit excepturi quisquam similique. Magni amet quam numquam voluptate vel itaque quod eaque perspiciatis. Reiciendis ex eaque rerum rem quasi eius. Eaque illo amet.\nDoloribus pariatur ea consectetur ad molestias ab cum esse autem. Rerum nemo impedit qui quibusdam iusto. Praesentium cum deserunt. Fugit exercitationem eum. Libero magni ullam amet modi quis deleniti nesciunt quidem. Accusamus molestiae eos.\nHic optio delectus ducimus eaque maiores incidunt facilis incidunt. Deleniti aperiam consectetur atque nulla labore. Expedita adipisci explicabo explicabo perferendis. Maiores quisquam vel. Quasi aliquam veritatis animi molestiae. Autem ad hic optio est modi ullam doloremque sunt.\nNesciunt aut odio reprehenderit molestias. Consequatur saepe sunt recusandae autem accusamus quod amet ratione. Iure nobis sed necessitatibus reprehenderit. Possimus nobis sapiente itaque eos. Velit perferendis illo fuga.\nDolore facilis possimus impedit non magnam rerum tempora dolor delectus. Quo numquam molestias impedit nesciunt quasi atque aliquam accusantium expedita. Illo nam illum eaque veniam ullam sint at.\nQuidem officia optio ipsam optio. Omnis sapiente beatae ab corrupti fugit minus. Iste dolorum odio ab id provident dolore delectus. Aut a aut distinctio dolore voluptatibus iure voluptate.\nAperiam earum voluptates blanditiis neque tenetur dolorum dignissimos earum. Autem eveniet cum nobis ducimus. Aut dicta quis perferendis voluptatum natus corporis nam aliquam. Ea pariatur amet similique quis fuga earum pariatur. Necessitatibus cupiditate repudiandae modi est sit sit libero molestiae deserunt.\nNatus enim facere qui deleniti. Dolorem natus voluptas. Occaecati numquam odit pariatur occaecati voluptatibus earum. Totam debitis temporibus iusto.\nUt dignissimos vitae possimus. Totam asperiores error placeat rerum ipsam. Quos cumque quod aperiam iusto odit incidunt id totam.',
		name: 'We Can Work it Out',
		updatedAt: '2023-02-27T12:46:24.694Z',
		user: {
			avatar: 'http://localhost:3323/images/156.jpg',
			createdAt: '2023-02-27T12:46:24.381Z',
			description: 'Future Paradigm Analyst',
			email: 'torrey53@gmail.com',
			id: 178,
			name: 'Jermaine_Parker86',
			updatedAt: '2023-02-27T12:46:24.381Z'
		}
	};

	markdownList: string[] = [];

	constructor(
		private metaService: MetaService,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (markdownList: string[]) => (this.markdownList = markdownList),
				error: (error: any) => console.error(error)
			});

		this.setMeta();
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
		const title: string = 'Draft';

		// prettier-ignore
		const description: string = 'Stay up to date with the latest posts and insights from Draft';

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}
}
