"use client";

import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TextAlign } from "@tiptap/extension-text-align";
import {
	Color,
	FontFamily,
	FontSize,
	LineHeight,
	TextStyle,
} from "@tiptap/extension-text-style";
import { Indent } from "@/shared/components/form/rich-editor/tiptap-extension/document-extensions";
import { Typography } from "@tiptap/extension-typography";
import { Selection } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";

// --- UI Primitives ---
import { Button } from "@/shared/components/form/rich-editor/tiptap-ui-primitive/button";
import {
	Toolbar,
	ToolbarGroup,
	ToolbarSeparator,
} from "@/shared/components/form/rich-editor/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import "@/shared/components/form/rich-editor/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/shared/components/form/rich-editor/tiptap-node/code-block-node/code-block-node.scss";
import "@/shared/components/form/rich-editor/tiptap-node/heading-node/heading-node.scss";
import { HorizontalRule } from "@/shared/components/form/rich-editor/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/shared/components/form/rich-editor/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/shared/components/form/rich-editor/tiptap-node/image-node/image-node.scss";
import { ImageUploadNode } from "@/shared/components/form/rich-editor/tiptap-node/image-upload-node/image-upload-node-extension";
import "@/shared/components/form/rich-editor/tiptap-node/list-node/list-node.scss";
import "@/shared/components/form/rich-editor/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { BlockquoteButton } from "@/shared/components/form/rich-editor/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/shared/components/form/rich-editor/tiptap-ui/code-block-button";
import {
	ColorHighlightPopover,
	ColorHighlightPopoverButton,
	ColorHighlightPopoverContent,
} from "@/shared/components/form/rich-editor/tiptap-ui/color-highlight-popover";
import { HeadingDropdownMenu } from "@/shared/components/form/rich-editor/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/shared/components/form/rich-editor/tiptap-ui/image-upload-button";
import {
	LinkButton,
	LinkContent,
	LinkPopover,
} from "@/shared/components/form/rich-editor/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@/shared/components/form/rich-editor/tiptap-ui/list-dropdown-menu";
import {
	HighlightColorPopover,
	TextColorPopover,
} from "@/shared/components/form/rich-editor/tiptap-ui/color-palette";
import {
	ClearFormattingButton,
	FullscreenButton,
	FontFamilyDropdown,
	FontSizeDropdown,
	IndentGroup,
	LineHeightDropdown,
	PageBreakButton,
	UndoRedoGroup,
	WordCount,
} from "@/shared/components/form/rich-editor/tiptap-ui/document-toolbar";
import { MarkButton } from "@/shared/components/form/rich-editor/tiptap-ui/mark-button";
import { TableDropdownMenu } from "@/shared/components/form/rich-editor/tiptap-ui/table-dropdown-menu";
import { TextAlignButton } from "@/shared/components/form/rich-editor/tiptap-ui/text-align-button";
import { VoiceInputButton } from "@/shared/components/form/rich-editor/tiptap-ui/voice-input-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/shared/components/form/rich-editor/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/shared/components/form/rich-editor/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/shared/components/form/rich-editor/tiptap-icons/link-icon";

// --- Hooks ---
import { useCursorVisibility } from "@/shared/hooks/use-cursor-visibility";
import { useIsBreakpoint } from "@/shared/hooks/use-is-breakpoint";
import { useWindowSize } from "@/shared/hooks/use-window-size";

// --- Components ---

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/shared/lib/tiptap-utils";

// --- Styles ---
import "@/shared/components/form/rich-editor/simple-editor.scss";

const MainToolbarContent = ({
	onHighlighterClick,
	onLinkClick,
	isMobile,
	enableTables,
	documentMode,
	isFullscreen,
	onToggleFullscreen,
	enableVoiceInput,
}: {
	onHighlighterClick: () => void;
	onLinkClick: () => void;
	isMobile: boolean;
	enableTables?: boolean;
	documentMode?: boolean;
	isFullscreen?: boolean;
	onToggleFullscreen?: () => void;
	enableVoiceInput?: boolean;
}) => {
	return (
		<>
			{documentMode ? (
				<>
					<ToolbarGroup>
						<UndoRedoGroup />
					</ToolbarGroup>
					<ToolbarSeparator />
					<ToolbarGroup>
						<FontFamilyDropdown />
						<FontSizeDropdown />
					</ToolbarGroup>
					<ToolbarSeparator />
				</>
			) : null}

			<ToolbarGroup>
				<HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
				<ListDropdownMenu modal={false} types={["bulletList", "orderedList", "taskList"]} />
				<BlockquoteButton />
				<CodeBlockButton />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<MarkButton type="bold" />
				<MarkButton type="italic" />
				<MarkButton type="strike" />
				<MarkButton type="code" />
				<MarkButton type="underline" />
				{documentMode ? (
					<>
						<TextColorPopover />
						<HighlightColorPopover />
					</>
				) : !isMobile ? (
					<ColorHighlightPopover />
				) : (
					<ColorHighlightPopoverButton onClick={onHighlighterClick} />
				)}
				{!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<MarkButton type="superscript" />
				<MarkButton type="subscript" />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<TextAlignButton align="left" />
				<TextAlignButton align="center" />
				<TextAlignButton align="right" />
				<TextAlignButton align="justify" />
			</ToolbarGroup>

			<ToolbarSeparator />

			{documentMode ? (
				<>
					<ToolbarGroup>
						<LineHeightDropdown />
						<IndentGroup />
					</ToolbarGroup>
					<ToolbarSeparator />
				</>
			) : null}

			{enableVoiceInput ? (
				<>
					<ToolbarGroup>
						<VoiceInputButton />
					</ToolbarGroup>
					<ToolbarSeparator />
				</>
			) : null}

			<ToolbarGroup>
				<ImageUploadButton text="Add" />
				{enableTables ? <TableDropdownMenu /> : null}
				{documentMode ? (
					<>
						<PageBreakButton />
						<ClearFormattingButton />
					</>
				) : null}
			</ToolbarGroup>

			{documentMode ? (
				<>
					<WordCount />
					{onToggleFullscreen ? (
						<ToolbarGroup>
							<FullscreenButton
								active={Boolean(isFullscreen)}
								onToggle={onToggleFullscreen}
							/>
						</ToolbarGroup>
					) : null}
				</>
			) : null}
		</>
	);
};

const MobileToolbarContent = ({
	type,
	onBack,
}: {
	type: "highlighter" | "link";
	onBack: () => void;
}) => (
	<>
		<ToolbarGroup>
			<Button variant="ghost" onClick={onBack}>
				<ArrowLeftIcon className="tiptap-button-icon" />
				{type === "highlighter" ? (
					<HighlighterIcon className="tiptap-button-icon" />
				) : (
					<LinkIcon className="tiptap-button-icon" />
				)}
			</Button>
		</ToolbarGroup>

		<ToolbarSeparator />

		{type === "highlighter" ? <ColorHighlightPopoverContent /> : <LinkContent />}
	</>
);

export function SimpleEditor({
	value,
	onValueChange,
	className,
	enableTables = false,
	documentMode = false,
	enableVoiceInput = false,
	editorClassName,
}: {
	value?: string;
	onValueChange?: (value: string) => void;
	className?: string;
	/**
	 * Adds table extensions and the table toolbar menu. Off by default so the
	 * existing short-form editors keep their current toolbar.
	 */
	enableTables?: boolean;
	/**
	 * Turns the editor into a word processor: A4 page canvas plus font family,
	 * font size, colour, line spacing, indent, page break and word count.
	 * Implies table support.
	 */
	documentMode?: boolean;
	/**
	 * Shows a microphone that dictates straight into the document (Bangla by
	 * default). Hidden automatically where the browser has no Web Speech API.
	 */
	enableVoiceInput?: boolean;
	/** Extra classes for the editable surface itself (e.g. a taller page). */
	editorClassName?: string;
}) {
	// Document mode is meaningless without tables — every real syllabus uses them.
	const tablesEnabled = enableTables || documentMode;
	const isMobile = useIsBreakpoint();
	const { height } = useWindowSize();
	const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">("main");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const toolbarRef = useRef<HTMLDivElement>(null);

	const editor = useEditor({
		immediatelyRender: false,
		editorProps: {
			attributes: {
				autocomplete: "off",
				autocorrect: "off",
				autocapitalize: "off",
				"aria-label": "Main content area, start typing to enter text.",
				// No `dark:prose-invert` in document mode: the page represents
				// printed paper and stays white in either theme, but prose-invert
				// would still flip --tw-prose-bold/headings/links to white, making
				// bold text invisible on it.
				class: documentMode
					? `simple-editor document-page prose ${editorClassName || ""}`
					: `simple-editor min-h-[150px] w-full bg-transparent px-3 py-2 text-sm outline-none prose prose-sm dark:prose-invert max-w-none ${editorClassName || ""}`,
			},
		},
		extensions: [
			StarterKit.configure({
				horizontalRule: false,
				link: {
					openOnClick: false,
					enableClickSelection: true,
				},
			}),
			HorizontalRule,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			TaskList,
			TaskItem.configure({ nested: true }),
			Highlight.configure({ multicolor: true }),
			Image,
			Typography,
			Superscript,
			Subscript,
			Selection,
			...(tablesEnabled
				? [
						Table.configure({ resizable: true }),
						TableRow,
						TableHeader,
						TableCell,
					]
				: []),
			// TextStyle is the carrier mark for Color/FontFamily/FontSize, so it
			// has to be registered alongside them.
			...(documentMode
				? [TextStyle, Color, FontFamily, FontSize, LineHeight, Indent]
				: []),
			ImageUploadNode.configure({
				accept: "image/*",
				maxSize: MAX_FILE_SIZE,
				limit: 3,
				upload: handleImageUpload,
				onError: (error) => console.error("Upload failed:", error),
			}),
		],
		content: value || "",
		onUpdate: ({ editor }) => {
			onValueChange?.(editor.getHTML());
		},
	});

	// Full screen is a styled overlay rather than the Fullscreen API: the editor
	// lives inside a form, and the native API would detach it from the page's
	// stacking context, hiding the toolbar's portalled dropdowns and popovers.
	useEffect(() => {
		if (!isFullscreen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsFullscreen(false);
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isFullscreen]);

	const [overlayHeight, setOverlayHeight] = useState(0);

	// Sync external value changes (like form.reset() with async data)
	useEffect(() => {
		if (!editor || value === undefined) return;
		const currentContent = editor.getHTML();
		if (value === currentContent || (value === "" && currentContent === "<p></p>")) return;

		// Preserve the cursor position by keeping focus if it already has it,
		// but just set the content directly
		editor.commands.setContent(value, { emitUpdate: false });
	}, [value, editor]);

	useEffect(() => {
		if (toolbarRef.current) {
			setOverlayHeight(toolbarRef.current.getBoundingClientRect().height);
			const observer = new ResizeObserver((entries) => {
				setOverlayHeight(entries[0].contentRect.height);
			});
			observer.observe(toolbarRef.current);
			return () => observer.disconnect();
		}
	}, []);

	const rect = useCursorVisibility({
		editor,
		overlayHeight,
	});
	useEffect(() => {
		if (!isMobile && mobileView !== "main") {
			setMobileView("main");
		}
	}, [isMobile, mobileView]);

	return (
		<div
			className={`border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex w-full flex-col overflow-hidden rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:ring-3 ${isFullscreen ? "document-editor-fullscreen" : ""} ${className || ""}`}
		>
			<EditorContext.Provider value={{ editor }}>
				<Toolbar
					ref={toolbarRef}
					className="border-input border-b bg-transparent"
					style={{
						...(isMobile
							? {
									bottom: `calc(100% - ${height - rect.y}px)`,
								}
							: {}),
					}}
				>
					{mobileView === "main" ? (
						<MainToolbarContent
							onHighlighterClick={() => setMobileView("highlighter")}
							onLinkClick={() => setMobileView("link")}
							isMobile={isMobile}
							enableTables={tablesEnabled}
							documentMode={documentMode}
							enableVoiceInput={enableVoiceInput}
							isFullscreen={isFullscreen}
							onToggleFullscreen={
								documentMode ? () => setIsFullscreen((current) => !current) : undefined
							}
						/>
					) : (
						<MobileToolbarContent
							type={mobileView === "highlighter" ? "highlighter" : "link"}
							onBack={() => setMobileView("main")}
						/>
					)}
				</Toolbar>

				<EditorContent
					editor={editor}
					role="presentation"
					className={documentMode ? "document-canvas" : ""}
				/>
			</EditorContext.Provider>
		</div>
	);
}
