/** @format */

import MarkdownIt, { StateBlock, Token } from 'markdown-it';
import mermaid, { RunOptions } from 'mermaid';

export default function MermaidPlugin(md: MarkdownIt, options: any): void {
	const tokenListRendered: Record<number, Partial<Token>> = {};

	if (typeof window !== 'undefined') {
		mermaid.initialize({
			securityLevel: 'loose',
			startOnLoad: false,
			...options
		});
	}

	md.block.ruler.before('fence', 'mermaid', (state: StateBlock, startLine: number, endLine: number): boolean => {
		const pos: number = state.bMarks[startLine] + state.tShift[startLine];
		const max: number = state.eMarks[startLine];

		if (state.src.slice(pos, pos + 3) !== '```') {
			return false;
		}

		const nextLine: number = startLine + 1;

		if (nextLine >= endLine) {
			return false;
		}

		const markup: string = state.src.slice(pos, max).trim();

		if (markup !== '``` mermaid' && markup !== '```mermaid') {
			return false;
		}

		for (let i = nextLine; i < endLine; i++) {
			if (state.src.slice(state.bMarks[i], state.eMarks[i]).trim() === '```') {
				state.line = i + 1;

				const token: Token = state.push('mermaid', 'code', 0);

				token.info = 'mermaid';
				token.content = state.getLines(nextLine, i, state.blkIndent, true).trim();
				token.markup = '```';
				token.map = [startLine, state.line];

				return true;
			}
		}

		return false;
	});

	// Custom renderer for code mermaid blocks
	md.renderer.rules.mermaid = (tokenList: Token[], idx: number): string => {
		const token: Token = tokenList[idx];
		const tokenContent: string = token.content.trim();
		const tokenSelectorId: string = `mermaid-${idx}`;

		const isSameInfo: boolean = tokenListRendered[idx]?.info === token.info;
		const isSameContent: boolean = tokenListRendered[idx]?.content === token.content;

		// Avoid unnecessary rerender
		if (isSameInfo && isSameContent) {
			return tokenListRendered[idx].meta.outerHTML;
		} else {
			if (typeof window !== 'undefined') {
				// Required timeout to run after return
				setTimeout(() => {
					const runOptions: RunOptions = {
						nodes: document.querySelectorAll('pre.mermaid')
					};

					mermaid
						.run(runOptions)
						.then(() => {
							tokenListRendered[idx] = token;
							tokenListRendered[idx].meta = document.getElementById(tokenSelectorId);
						})
						.catch((error: any) => console.error(error));
				});
			}

			return `<pre id="${tokenSelectorId}" class="mermaid">${tokenContent}</pre>`;
		}
	};
}
