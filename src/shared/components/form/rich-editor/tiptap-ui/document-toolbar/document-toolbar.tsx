"use client";

import {
	FONT_FAMILIES,
	FONT_SIZES,
	LINE_HEIGHTS,
} from "@/shared/components/form/rich-editor/tiptap-extension/document-extensions";
import { Button } from "@/shared/components/form/rich-editor/tiptap-ui-primitive/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/form/rich-editor/tiptap-ui-primitive/dropdown-menu";
import { useTiptapEditor } from "@/shared/hooks/use-tiptap-editor";
import {
	ChevronDown,
	IndentDecrease,
	IndentIncrease,
	Maximize2,
	Minimize2,
	RemoveFormatting,
	SeparatorHorizontal,
	Undo2,
	Redo2,
} from "lucide-react";

export function UndoRedoGroup() {
	const { editor } = useTiptapEditor();
	if (!editor) return null;
	return (
		<>
			<Button
				type="button"
				data-style="ghost"
				aria-label="Undo"
				tooltip="Undo"
				disabled={!editor.can().undo()}
				onClick={() => editor.chain().focus().undo().run()}
			>
				<Undo2 className="tiptap-button-icon" />
			</Button>
			<Button
				type="button"
				data-style="ghost"
				aria-label="Redo"
				tooltip="Redo"
				disabled={!editor.can().redo()}
				onClick={() => editor.chain().focus().redo().run()}
			>
				<Redo2 className="tiptap-button-icon" />
			</Button>
		</>
	);
}

export function FontFamilyDropdown() {
	const { editor } = useTiptapEditor();
	if (!editor) return null;

	const active =
		FONT_FAMILIES.find(
			(font) => font.value && editor.isActive("textStyle", { fontFamily: font.value })
		)?.label || "Default";

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button type="button" data-style="ghost" tooltip="Font" className="min-w-28 gap-1">
					<span className="truncate text-xs">{active}</span>
					<ChevronDown className="tiptap-button-icon" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
				{FONT_FAMILIES.map((font) => (
					<DropdownMenuItem
						key={font.label}
						onClick={() => {
							if (!font.value) editor.chain().focus().unsetFontFamily().run();
							else editor.chain().focus().setFontFamily(font.value).run();
						}}
					>
						<span style={font.value ? { fontFamily: font.value } : undefined}>{font.label}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function FontSizeDropdown() {
	const { editor } = useTiptapEditor();
	if (!editor) return null;

	const active =
		FONT_SIZES.find((size) => editor.isActive("textStyle", { fontSize: size })) || "11pt";

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button type="button" data-style="ghost" tooltip="Font size" className="min-w-16 gap-1">
					<span className="text-xs">{active.replace("pt", "")}</span>
					<ChevronDown className="tiptap-button-icon" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
				{FONT_SIZES.map((size) => (
					<DropdownMenuItem key={size} onClick={() => editor.chain().focus().setFontSize(size).run()}>
						{size.replace("pt", "")}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function LineHeightDropdown() {
	const { editor } = useTiptapEditor();
	if (!editor) return null;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button type="button" data-style="ghost" aria-label="Line spacing" tooltip="Line spacing">
					<SeparatorHorizontal className="tiptap-button-icon" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{LINE_HEIGHTS.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => editor.chain().focus().setLineHeight(option.value).run()}
					>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function IndentGroup() {
	const { editor } = useTiptapEditor();
	if (!editor) return null;
	return (
		<>
			<Button
				type="button"
				data-style="ghost"
				aria-label="Decrease indent"
				tooltip="Decrease indent"
				onClick={() => {
					const itemType = editor.isActive("taskItem") ? "taskItem" : "listItem";
					if (editor.isActive("listItem") || editor.isActive("taskItem")) {
						editor.chain().focus().liftListItem(itemType).run();
						return;
					}
					editor.chain().focus().outdent().run();
				}}
			>
				<IndentDecrease className="tiptap-button-icon" />
			</Button>
			<Button
				type="button"
				data-style="ghost"
				aria-label="Increase indent"
				tooltip="Increase indent"
				onClick={() => {
					const itemType = editor.isActive("taskItem") ? "taskItem" : "listItem";
					if (editor.isActive("listItem") || editor.isActive("taskItem")) {
						editor.chain().focus().sinkListItem(itemType).run();
						return;
					}
					editor.chain().focus().indent().run();
				}}
			>
				<IndentIncrease className="tiptap-button-icon" />
			</Button>
		</>
	);
}

export function ClearFormattingButton() {
	const { editor } = useTiptapEditor();
	if (!editor) return null;
	return (
		<Button
			type="button"
			data-style="ghost"
			aria-label="Clear formatting"
			tooltip="Clear formatting"
			onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
		>
			<RemoveFormatting className="tiptap-button-icon" />
		</Button>
	);
}

export function PageBreakButton() {
	const { editor } = useTiptapEditor();
	if (!editor) return null;
	return (
		<Button
			type="button"
			data-style="ghost"
			aria-label="Page break"
			tooltip="Insert page break"
			// Tiptap has no pagination, so a page break is an explicit marker the
			// PDF renderer honours via CSS `break-after: page`.
			onClick={() =>
				editor
					.chain()
					.focus()
					.insertContent('<hr data-page-break="true" />')
					.run()
			}
		>
			<span className="text-[10px] font-semibold tracking-tight">PG</span>
		</Button>
	);
}

export function WordCount() {
	const { editor } = useTiptapEditor();
	if (!editor) return null;
	const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, " ", " ");
	const words = text.trim() ? text.trim().split(/\s+/).length : 0;
	return (
		<span className="text-muted-foreground ml-auto pr-2 text-[11px] whitespace-nowrap tabular-nums">
			{words} words
		</span>
	);
}

/**
 * Presentational only — full-screen state belongs to the editor shell, which
 * owns the wrapper element that actually gets expanded.
 */
export function FullscreenButton({
	active,
	onToggle,
}: {
	active: boolean;
	onToggle: () => void;
}) {
	return (
		<Button
			type="button"
			data-style="ghost"
			data-active-state={active ? "on" : "off"}
			aria-label={active ? "Exit full screen" : "Full screen"}
			aria-pressed={active}
			tooltip={active ? "Exit full screen (Esc)" : "Full screen"}
			onClick={onToggle}
		>
			{active ? (
				<Minimize2 className="tiptap-button-icon" />
			) : (
				<Maximize2 className="tiptap-button-icon" />
			)}
		</Button>
	);
}
