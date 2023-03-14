/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../shared/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { CommonModule } from '@angular/common';
import { PostCardComponent } from '../shared/components/post/card/card.component';
import { MarkdownComponent } from '../shared/components/markdown/markdown.component';
import { AppInputTrimWhitespaceDirective } from '../shared/directives/app-input-trim-whitespace.directive';
import { AppInputMarkAsTouchedDirective } from '../shared/directives/app-input-mark-as-touched.directive';
import { FormsModule } from '@angular/forms';
import { ShareComponent } from '../shared/components/share/share.component';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		SvgIconComponent,
		CommonModule,
		PostCardComponent,
		MarkdownComponent,
		FormsModule,
		AppInputTrimWhitespaceDirective,
		AppInputMarkAsTouchedDirective,
		ShareComponent
	],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
	featureList: any[] = [
		'Absolutely free',
		'Easy to use',
		'Fast loading',
		'Customizable',
		'Rich editor',
		'Works online',
		'Markdown syntax',
		'Lightweight',
		'Mobile support',
		'Sharable',
		'Code highlight',
		'Github emoji'
	];

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

	markdown: string = `
# Build your personal content base

Without annoying background, you don't need no more to chat or comment or whatever just focus on your idea. We can offer a streamlined and efficient way to create and publish high-quality content, without getting bogged down in complex formatting and design issues.

- **Absolutely free**
- **Easy to use**
  - Lightweight app
  - Customizable
  - Works offline
  - Mobile support
- **Rich editor**
  - Media content
  - Markdown syntax
  - Code highlight
  - Github emoji

# For sellers

We are pleased to offer you a fantastic opportunity to showcase your products to a wider audience on our website. With our unlimited storage and strong SEO capabilities, we can help you reach a larger audience and promote your products effectively.

### The Chair is an excellent value for anyone in need of comfortable and stylish seating

| --- | --- | --- | --- |
| ![](/assets/ikea-chair.png){width=170 height=170} | **Price**: 50$ |||
| ^^ | **Delivery**: Worldwide |||
| ^^ | **Contact**: [https://www.npmjs.com/package/markdown-it-multimd-table](https://www.npmjs.com/package/markdown-it-multimd-table) |||
| ^^ | [Buy](https://www.npmjs.com/search?q=markdown-it){.btn .btn-success .mr-4} **Stock**: 999 |||
| Introducing the Chair, a stylish and versatile seating option that's perfect for any space. This chair is a popular choice for modern homes and offices, offering a sleek and minimalist design that complements a wide range of decor styles. Made with durable materials, the Chair is built to last and withstand daily wear and tear. The frame is made from sturdy steel and features a powder-coated finish that adds an extra layer of protection against rust and corrosion. The seat and backrest are made from high-quality polypropylene, which is lightweight, easy to clean, and resists fading over time. ||||

### Check our other images of Chair

| --- | --- | --- | --- | --- |
| ![](/assets/ikea-chair.png) | ![](/assets/ikea-chair.png) | ![](/assets/ikea-chair.png) | ![](/assets/ikea-chair.png) | ![](/assets/ikea-chair.png) |

# For coders

Our app is offering a good highlight syntax for talented IT developers to write tutorials and guides on a variety of topics, including programming languages, frameworks, and best practices.

_Typescript_

\`\`\` typescript
const sayHello = (name: string): string => {
  return \`Hello \${name}\`
};
\`\`\`

_Markup_

\`\`\` markup
<div class="flex">
  <button type="button">Click me</button>
</div>
\`\`\`

_SCSS_

\`\`\` scss
.scrollbar {
  @screen mouse {
    $color-track: hsl(var(--b1));
  }
}
\`\`\`

We have all 297 languages currently supported by [Prism](https://prismjs.com/) and pack of awesome themes for it.\n

Press [F]{.kbd .kbd-sm} to pay respects.

# Deep dive

You can use advanced layout provided by [DaisyUI](https://daisyui.com/) take a look there for documentation

Our layout is also highly customizable, allowing users to tailor it to their specific needs and preferences. This makes it easy to add and remove elements as needed, change color schemes, and adjust layouts to better suit the content and audience.

+++ Alert informs users about important events.
[12 unread messages. Tap to see.]{.alert}

[New software update available.]{.alert .alert-info}

[Your purchase has been confirmed!]{.alert .alert-success}

[Warning: Invalid email address!]{.alert .alert-warning}

[Error! Task failed successfully.]{.alert .alert-error}
+++

+++ Buttons allow the user to take actions or make choices.
[Primary]{.btn .btn-primary} [Secondary]{.btn .btn-secondary} [Accent]{.btn .btn-accent} [Info]{.btn .btn-info} [Success]{.btn .btn-success} [Warning]{.btn .btn-warning} [Error]{.btn .btn-error} [Ghost]{.btn .btn-ghost} [Link]{.btn .btn-link}
+++

+++ Badges are used to inform the user of the status of specific data.
[Primary]{.badge .badge-primary} [Secondary]{.badge .badge-secondary} [Accent]{.badge .badge-accent} [Info]{.badge .badge-info} [Success]{.badge .badge-success} [Warning]{.badge .badge-warning} [Error]{.badge .badge-error}
+++

+++ Link adds the missing underline style to links.
[Primary]{.link .link-primary} [Secondary]{.link .link-secondary} [Accent]{.link .link-accent} [Info]{.link .link-info} [Success]{.link .link-success} [Warning]{.link .link-warning} [Error]{.link .link-error}
+++

+++ Mask crops the content of the element to common shapes.
| --- | --- | --- | --- | --- | --- |
| ![Chair](/assets/ikea-chair.png){.mask .mask-squircle} | ![Chair](/assets/ikea-chair.png){.mask .mask-heart} | ![Chair](/assets/ikea-chair.png){.mask .mask-hexagon} | ![Chair](/assets/ikea-chair.png){.mask .mask-hexagon-2} | ![Chair](/assets/ikea-chair.png){.mask .mask-decagon} | ![Chair](/assets/ikea-chair.png){.mask .mask-pentagon} |
| ![Chair](/assets/ikea-chair.png){.mask .mask-diamond} | ![Chair](/assets/ikea-chair.png){.mask .mask-square} | ![Chair](/assets/ikea-chair.png){.mask .mask-circle} | ![Chair](/assets/ikea-chair.png){.mask .mask-parallelogram} | ![Chair](/assets/ikea-chair.png){.mask .mask-parallelogram-2} | ![Chair](/assets/ikea-chair.png){.mask .mask-parallelogram-3} |
| ![Chair](/assets/ikea-chair.png){.mask .mask-parallelogram-4} | ![Chair](/assets/ikea-chair.png){.mask .mask-star} | ![Chair](/assets/ikea-chair.png){.mask .mask-star-2} | ![Chair](/assets/ikea-chair.png){.mask .mask-triangle} | ![Chair](/assets/ikea-chair.png){.mask .mask-triangle-2} | ![Chair](/assets/ikea-chair.png){.mask .mask-triangle-3} |
| ![Chair](/assets/ikea-chair.png){.mask .mask-triangle-4} |  |  |  |  |  |
+++

+++ Steps can be used to show a list of steps in a process.
- Media content{.step .step-primary}
- Markdown syntax{.step .step-primary}
- Code highlight{.step}
- Github emoji{.step}
{.steps .not-prose}

asd

- Media content{.step .step-primary}
- Markdown syntax{.step .step-primary}
- Code highlight{.step}
- Github emoji{.step}
{.steps .steps-vertical .not-prose}
+++

+++ Menu is used to display a list of links vertically or horizontally.
- [Media content]()
- [Markdown syntax]()
- [Code highlight]()
- [Github emoji]()
{.menu .not-prose}

asd

- [Media content]()
- [Markdown syntax](){.active}
- [Code highlight]()
- [Github emoji]()
{.menu .menu-horizontal .not-prose}
+++

+++ Navbar is used to show a navigation bar on the top of the page.
[Navbar]{.navbar .navbar-center .border .border-base-content/20 .rounded-box}
+++

+++ Table can be used to show a list of data in a table format.
        | NAME | JOB | FAVORITE COLOR
------- | ---- | --- | --------------
1 | Cy Ganderton | Quality Control Specialist | Blue
2 | Hart Hagerty | Desktop Support Technician | Purple
3 | Brice Swyre | Tax Accountant | Red

{.table .table-zebra .no-prose}

header1 | header2
------- | -------
column1 | column2
column1 | column2
column1 | column2
column1 | column2

{.table .table-compact}
+++

+++ Utilities for controlling how flex items both grow and shrink.
\` flex \`
\` items-center \`
\` justify-center \`
+++

# Roadmap

- [ ] Migrate to webP
- [ ] Improve markdown editor
- [ ] Download raw and rendered markdown as pdf
- [ ] Improve authorization, migrate to Redis
- [ ] Soft delete for all entities
- [ ] RSS feed?

@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

Wanna use this app in your language? [Contact us](#)
`;

	show: boolean;

	constructor(private metaService: MetaService) {}

	ngOnInit(): void {
		const classList: string[] = [
			'badge-primary',
			'badge-secondary',
			'badge-accent',
			'badge-info',
			'badge-success',
			'badge-warning',
			'badge-error'
		];

		this.setMeta();
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
