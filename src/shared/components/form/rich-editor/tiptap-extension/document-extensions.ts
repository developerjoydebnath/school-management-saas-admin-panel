import { Extension } from "@tiptap/core";

/**
 * Word-processor extras that Tiptap does not ship.
 *
 * Font family, font size, colour and line height all come from the official
 * `@tiptap/extension-text-style` package (Tiptap 3 bundles them) — only
 * paragraph indentation is missing, so that is all this file adds.
 */

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		indent: {
			indent: () => ReturnType;
			outdent: () => ReturnType;
		};
	}
}

const MAX_INDENT_LEVEL = 8;
const INDENT_STEP_REM = 2.5;

export const Indent = Extension.create({
	name: "indent",

	addOptions() {
		return { types: ["paragraph", "heading"] };
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					indent: {
						default: 0,
						parseHTML: (element) => Number(element.getAttribute("data-indent")) || 0,
						renderHTML: (attributes) => {
							const level = Number(attributes.indent) || 0;
							if (level <= 0) return {};
							return {
								"data-indent": level,
								style: `margin-left: ${level * INDENT_STEP_REM}rem`,
							};
						},
					},
				},
			},
		];
	},

	addCommands() {
		const shift = (direction: 1 | -1) => () => {
			return ({ state, tr, dispatch }: any) => {
				const { from, to } = state.selection;
				let changed = false;

				state.doc.nodesBetween(from, to, (node: any, pos: number) => {
					if (!this.options.types.includes(node.type.name)) return;
					const current = Number(node.attrs.indent) || 0;
					const next = Math.min(MAX_INDENT_LEVEL, Math.max(0, current + direction));
					if (next === current) return;
					// Addressed by position so a multi-block selection indents every
					// block, not just the one holding the cursor.
					tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
					changed = true;
				});

				if (changed && dispatch) dispatch(tr);
				return changed;
			};
		};

		return {
			indent: shift(1),
			outdent: shift(-1),
		};
	},

	addKeyboardShortcuts() {
		// Inside a list, Tab must nest the item (Word/Docs behaviour) rather than
		// shift the paragraph inside it. Only fall back to block indentation when
		// the cursor is not in a list.
		const inList = () =>
			this.editor.isActive("listItem") || this.editor.isActive("taskItem");

		return {
			Tab: () => {
				if (inList()) {
					const itemType = this.editor.isActive("taskItem") ? "taskItem" : "listItem";
					return this.editor.chain().focus().sinkListItem(itemType).run();
				}
				return this.editor.commands.indent();
			},
			"Shift-Tab": () => {
				if (inList()) {
					const itemType = this.editor.isActive("taskItem") ? "taskItem" : "listItem";
					return this.editor.chain().focus().liftListItem(itemType).run();
				}
				return this.editor.commands.outdent();
			},
		};
	},
});

/** Fonts that render Bangla correctly alongside Latin, plus the usual Office set. */
export const FONT_FAMILIES = [
	{ label: "Default", value: "" },
	{ label: "Arial", value: "Arial, sans-serif" },
	{ label: "Times New Roman", value: '"Times New Roman", serif' },
	{ label: "Calibri", value: "Calibri, sans-serif" },
	{ label: "Georgia", value: "Georgia, serif" },
	{ label: "Courier New", value: '"Courier New", monospace' },
	{ label: "SolaimanLipi (বাংলা)", value: '"SolaimanLipi", "Noto Sans Bengali", sans-serif' },
	{ label: "Kalpurush (বাংলা)", value: '"Kalpurush", "Noto Sans Bengali", sans-serif' },
	{ label: "Nikosh (বাংলা)", value: '"Nikosh", "Noto Sans Bengali", sans-serif' },
	{ label: "Noto Sans Bengali", value: '"Noto Sans Bengali", sans-serif' },
];

export const FONT_SIZES = [
	"8pt",
	"9pt",
	"10pt",
	"11pt",
	"12pt",
	"14pt",
	"16pt",
	"18pt",
	"20pt",
	"24pt",
	"28pt",
	"36pt",
	"48pt",
];

export const LINE_HEIGHTS = [
	{ label: "Single", value: "1" },
	{ label: "1.15", value: "1.15" },
	{ label: "1.5", value: "1.5" },
	{ label: "Double", value: "2" },
];
