/** @format */

import Mermaid, { RenderResult } from 'mermaid';
import MarkdownIt, { Options, Renderer, Token } from 'markdown-it';

// prettier-ignore
export function mermaid(markdownIt: MarkdownIt, options: any, isBrowser: boolean): void {
	const defaultFenceRenderer: Renderer.RenderRule = markdownIt.renderer.rules.fence;

	if (isBrowser) {
		Mermaid.initialize({
			securityLevel: 'loose',
			startOnLoad: false,
			...options
		});

		markdownIt.renderer.rules.fence = (tokenList: Token[], idx: number, options: Options, env: any, self: Renderer): any => {
			const token: Token = tokenList[idx];
			const info: string = token.info.trim();

			if (info !== 'mermaid') {
				return defaultFenceRenderer ? defaultFenceRenderer(tokenList, idx, options, env, self) : '';
			} else {
				const mermaidId: string = 'mermaid-' + idx;
				const mermaidContainerId: string = 'mermaid-container-' + idx;

				const setMermaidOutput = (html: string): void => {
					const mermaidIdElement: HTMLImageElement = document.getElementById(mermaidId) as HTMLImageElement;

					mermaidIdElement.src = `data:image/svg+xml,${encodeURIComponent(html)}`;
				};

				const getMermaidErrorTemplate = (errorMessage: string): string => {
					document?.getElementById(mermaidContainerId).remove();

					return `
						<svg xmlns="http://www.w3.org/2000/svg">
					    <foreignObject width="100%" height="100%">
				        <pre style="white-space: pre-wrap;" xmlns="http://www.w3.org/1999/xhtml">${errorMessage}</pre>
					    </foreignObject>
						</svg>
					`;
				};

				Mermaid.render(mermaidContainerId, token.content)
					.then((renderResult: RenderResult) => setMermaidOutput(renderResult.svg))
					.catch((error: any) => setMermaidOutput(getMermaidErrorTemplate(error.message)));

				return `<img id=${mermaidId} src="./assets/images/placeholder-image.svg" loading="lazy" alt="Mermaid" aria-label="Mermaid" title="Mermaid" />`;
			}
		};
	} else {
		markdownIt.renderer.rules.fence = (): any => {
			return `
				<figure class="relative" aria-label="Loading" title="Loading">
					<div class="w-full h-64"></div>
					<div class="bg-base-300 animate-pulse rounded-box w-full h-full absolute inset-0 z-10"></div>
				</figure>
			`;
		};
	}
}
