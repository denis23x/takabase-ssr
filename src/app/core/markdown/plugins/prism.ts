/** @format */

import Prism from 'prismjs';
import 'prismjs/plugins/autolinker/prism-autolinker.min.js';
import 'prismjs/plugins/autoloader/prism-autoloader.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/treeview/prism-treeview.min.js';
import 'prismjs/plugins/match-braces/prism-match-braces.min.js';
import type MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it';

export default function PrismPlugin(md: MarkdownIt): void {
	const tokenListRendered: Record<number, Partial<Token>> = {};

	if (typeof window !== 'undefined') {
		Prism.manual = true;
		Prism.plugins.autoloader.languages_path = '/assets/grammars/';
		Prism.plugins.lineNumbers.assumeViewportIndependence = true;
	}

	// Custom renderer for code blocks
	md.renderer.rules.fence = (tokenList: Token[], idx: number): string => {
		const token: Token = tokenList[idx];
		const tokenInfo: string = token.info.trim();
		const tokenContent: string = token.content.trim();
		const tokenSelectorId: string = `prism-${idx}`;

		const isSameInfo: boolean = tokenListRendered[idx]?.info === token.info;
		const isSameContent: boolean = tokenListRendered[idx]?.content === token.content;
		const isSaveOuterHTML: boolean = !!tokenListRendered[idx]?.meta?.outerHTML;

		// Avoid unnecessary rerender
		if (isSameInfo && isSameContent && isSaveOuterHTML) {
			return tokenListRendered[idx].meta.outerHTML;
		} else {
			if (typeof window !== 'undefined') {
				// Required timeout to run after return
				setTimeout(() => {
					const element: Element = document.getElementById(tokenSelectorId).querySelector('code');

					Prism.highlightElement(element, false, () => {
						tokenListRendered[idx] = token;
						tokenListRendered[idx].meta = document.getElementById(tokenSelectorId);
					});
				});
			}
		}

		switch (tokenInfo) {
			case 'treeview': {
				return `<pre id="${tokenSelectorId}" class="language-${tokenInfo}"><code class="language-${tokenInfo}">${tokenContent}</code></pre>`;
			}
			default: {
				return `<pre id="${tokenSelectorId}" class="language-${tokenInfo} line-numbers"><code class="language-${tokenInfo} match-braces rainbow-braces">${md.utils.escapeHtml(tokenContent)}</code></pre>`;
			}
		}
	};
}
