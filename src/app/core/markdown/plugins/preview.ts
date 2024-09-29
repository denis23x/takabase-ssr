/** @format */

import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import type MarkdownIt from 'markdown-it';
import type { Renderer, Token } from 'markdown-it';
import type { Metadata } from 'unfurl.js/dist/types';

const linkPreview: any[] = [];

// prettier-ignore
const linkPreviewHtml = (metadata: Metadata, tokenUrl: string, tokenSelectorId: string): void => {
	const htmlElement: HTMLElement = document.getElementById(tokenSelectorId);

	if (htmlElement) {
		const previewUrl: URL = new URL(tokenUrl);
		const previewHost: string | undefined = previewUrl.origin.endsWith('/') ? previewUrl.origin.substring(0, previewUrl.origin.length - 1) : previewUrl.origin;
		const previewHostElement: string = previewHost ? `<span class="text-base-content text-xs underline mt-auto">${previewHost}</span>` : '';

		const previewTitle: string | undefined = metadata.title;
		const previewTitleElement: string = previewTitle ? `<span class="text-base-content text-sm font-bold truncate">${previewTitle}</span>` : '';

		const previewDescription: string | undefined = metadata.description || metadata.open_graph.description || metadata.twitter_card.description || 'Description not available for this page';
		const previewDescriptionElement: string = previewDescription ? `<p class="text-base-content/60 text-xs line-clamp-2 !m-0">${previewDescription}</p>` : '';

		// Image

		const previewImageUID: string = `preview-image-${customAlphabet(alphanumeric, 8)()}`;
		const previewImage: any | undefined = metadata.open_graph?.images.length ? metadata.open_graph?.images[0] : metadata.twitter_card?.images.length ? metadata.twitter_card?.images[0] : undefined;
		const previewImageElement: string = previewImage ? `<div class="aspect-square w-24 h-24 bg-base-300 animate-pulse" id="${previewImageUID}"></div>` : '';

		// Dynamic image (avoid broken images)

		if (previewImage) {
			const htmlImageElement: HTMLImageElement = new Image();

			htmlImageElement.onload = () => document.getElementById(previewImageUID).outerHTML = `<img class="block object-cover aspect-square w-24 h-24" loading="eager" width="96" height="96" src="${previewImage.url}" alt="${previewTitle}">`;
			htmlImageElement.onerror = () => document.getElementById(previewImageUID).remove();
			htmlImageElement.src = previewImage.url;
		}

		// Favicon

		const previewFaviconUID: string = `preview-favicon-${customAlphabet(alphanumeric, 8)()}`;
		const previewFavicon: string | undefined = metadata.favicon;
		const previewFaviconElement: string = previewFavicon ? `<div class="aspect-square w-4 h-4 bg-base-300 animate-pulse" id="${previewFaviconUID}"></div>` : '';

		// Dynamic favicon (avoid broken images)

		if (previewFavicon) {
			const htmlCoverElement: HTMLImageElement = new Image();

			htmlCoverElement.onload = () => document.getElementById(previewFaviconUID).outerHTML = `<img class="block object-cover aspect-square w-4 h-4" loading="eager" width="16" height="16" src="${previewFavicon}" alt="${previewTitle}">`;
			htmlCoverElement.onerror = () => document.getElementById(previewFaviconUID).remove();
			htmlCoverElement.src = previewFavicon;
		}

		// Template (avoid whitespace)

		const templateTitle: string = `<div class="flex items-center justify-start gap-2">${previewFaviconElement}${previewTitleElement}</div>`;
		const templateDescription: string = `<div class="flex flex-col justify-stretch gap-1 h-full w-full overflow-hidden p-2">${templateTitle}${previewDescriptionElement}${previewHostElement}</div>`;
		const templateLink: string = `<a class="flex items-center justify-start not-prose w-full" href="${tokenUrl}" rel="ugc nofollow noopener noreferrer" target="_blank">${previewImageElement}${templateDescription}</a>`;

		htmlElement.outerHTML = `<div class="flex border border-base-300 overflow-hidden rounded-xl w-full h-24 my-4" id="${tokenSelectorId}">${templateLink}</div>`;

		// Save render to avoid re-render

		linkPreview.push({
			url: tokenUrl,
			element: document.getElementById(tokenSelectorId)
		})
	}
};

const linkPreviewError = (tokenUrl: string, tokenSelectorId: string): void => {
	const htmlElement: HTMLElement = document.getElementById(tokenSelectorId);

	if (htmlElement) {
		const alertIcon: string = `<i class="fill-current"><svg width="1.5em" height="1.5em" viewBox="0 0 16 16"><use xlink:href="#bug"></use></svg></i>`;
		const alertTitle: string = `<span class="block font-bold first-letter:capitalize leading-6">Uh .. that didn't work</span>`;
		const alertDescription: string = `<p class="font-base first-letter:capitalize whitespace-normal text-ellipsis overflow-hidden !m-0">Error fetching URL metadata</p>`;
		const alertBody: string = `<div class="flex flex-col w-full">${alertTitle}${alertDescription}</div>`;

		htmlElement.outerHTML = `<div role="alert" class="alert alert-error grid-cols-alert" id="${tokenSelectorId}">${alertIcon}${alertBody}</div>`;

		// Save render to avoid re-render

		linkPreview.push({
			url: tokenUrl,
			element: document.getElementById(tokenSelectorId)
		});
	}
};

// prettier-ignore
export default function PreviewPlugin(md: MarkdownIt): void {
	// Remember old renderer, if override, or proxy to default renderer
	const defaultRender: Renderer.RenderRule = md.renderer.rules.link_open || function (tokenList: Token[], idx: number, options: MarkdownIt.Options, env: any, self: Renderer) {
		return self.renderToken(tokenList, idx, options);
	};

	// Custom renderer for @preview
	md.renderer.rules.link_open = function (tokenList: Token[], idx: number, options: MarkdownIt.Options, env, self: Renderer): string {
		const token: Token = tokenList[idx];
		const tokenNext: Token = tokenList[idx + 1];

		const tokenUrl: string = token.attrs[token.attrIndex('href')][1];
		const tokenSelectorId: string = `preview-${customAlphabet(alphanumeric, 8)()}`;
		const tokenRendered: any | undefined = linkPreview.find((tokenRendered: any) => tokenRendered.url === tokenUrl);

		if (tokenNext.type === 'text' && tokenNext.content === '@preview') {
			tokenList[idx + 1].content = ''; // hidden ???

			for (let i = idx + 1; i < tokenList.length; i++) {
				tokenList[i].hidden = true;

				if (tokenList[i].type === 'link_close') {
					break;
				}
			}

			// Avoid unnecessary rerender
			if (tokenRendered) {
				return tokenRendered.element.outerHTML;
			} else {
				if (typeof window !== 'undefined') {
					fetch(`/metadata/?url=${encodeURIComponent(tokenUrl)}`)
						.then((response: Response) => response.json())
						.then((response: any) => response.data)
						.then((metadata: Metadata) => metadata ? linkPreviewHtml(metadata, tokenUrl, tokenSelectorId) : linkPreviewError(tokenUrl, tokenSelectorId))
						.catch(() => linkPreviewError(tokenUrl, tokenSelectorId));
				}

				return `<div class="border border-base-300 overflow-hidden rounded-xl w-full h-24 bg-base-300 animate-pulse my-4" id="${tokenSelectorId}"></div>`;
			}
		} else {
			// Pass token to default renderer
			return defaultRender(tokenList, idx, options, env, self);
		}
	};
}
