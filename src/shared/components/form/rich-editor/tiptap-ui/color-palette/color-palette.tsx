"use client";

import { Button } from "@/shared/components/form/rich-editor/tiptap-ui-primitive/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/form/rich-editor/tiptap-ui-primitive/popover";
import { useTiptapEditor } from "@/shared/hooks/use-tiptap-editor";
import { Ban, Baseline, Highlighter } from "lucide-react";
import * as React from "react";

/**
 * Google Docs-style swatch grid: a greyscale row, a saturated hue row, then
 * tint/shade rows built from the same hues so lighter picks read as a family
 * rather than an arbitrary list.
 */
const GREYS = [
	"#000000",
	"#434343",
	"#666666",
	"#999999",
	"#b7b7b7",
	"#cccccc",
	"#d9d9d9",
	"#efefef",
	"#f3f3f3",
	"#ffffff",
];

const HUES = [
	"#980000",
	"#ff0000",
	"#ff9900",
	"#ffff00",
	"#00ff00",
	"#00ffff",
	"#4a86e8",
	"#0000ff",
	"#9900ff",
	"#ff00ff",
];

/** Five tint/shade steps per hue, light → dark, matching the Docs layout. */
const SHADES = [
	[
		"#e6b8af",
		"#f4cccc",
		"#fce5cd",
		"#fff2cc",
		"#d9ead3",
		"#d0e0e3",
		"#c9daf8",
		"#cfe2f3",
		"#d9d2e9",
		"#ead1dc",
	],
	[
		"#dd7e6b",
		"#ea9999",
		"#f9cb9c",
		"#ffe599",
		"#b6d7a8",
		"#a2c4c9",
		"#a4c2f4",
		"#9fc5e8",
		"#b4a7d6",
		"#d5a6bd",
	],
	[
		"#cc4125",
		"#e06666",
		"#f6b26b",
		"#ffd966",
		"#93c47d",
		"#76a5af",
		"#6d9eeb",
		"#6fa8dc",
		"#8e7cc3",
		"#c27ba0",
	],
	[
		"#a61c00",
		"#cc0000",
		"#e69138",
		"#f1c232",
		"#6aa84f",
		"#45818e",
		"#3c78d8",
		"#3d85c6",
		"#674ea7",
		"#a64d79",
	],
	[
		"#5b0f00",
		"#660000",
		"#783f04",
		"#7f6000",
		"#274e13",
		"#0c343d",
		"#1c4587",
		"#073763",
		"#20124d",
		"#4c1130",
	],
];

function Swatch({
	color,
	active,
	onSelect,
}: {
	color: string;
	active: boolean;
	onSelect: (color: string) => void;
}) {
	return (
		<button
			type="button"
			title={color}
			aria-label={color}
			onClick={() => onSelect(color)}
			className="tiptap-color-swatch"
			data-active={active ? "true" : undefined}
			style={{ backgroundColor: color }}
		/>
	);
}

function PaletteGrid({
	value,
	onSelect,
}: {
	value?: string | null;
	onSelect: (color: string) => void;
}) {
	const normalized = (value || "").toLowerCase();
	const row = (colors: string[], key: string) => (
		<div className="tiptap-color-row" key={key}>
			{colors.map((color) => (
				<Swatch
					key={color}
					color={color}
					active={normalized === color.toLowerCase()}
					onSelect={onSelect}
				/>
			))}
		</div>
	);

	return (
		<div className="tiptap-color-grid">
			{row(GREYS, "greys")}
			{row(HUES, "hues")}
			<div className="tiptap-color-gap" />
			{SHADES.map((colors, index) => row(colors, `shade-${index}`))}
		</div>
	);
}

export function TextColorPopover() {
	const { editor } = useTiptapEditor();
	const [open, setOpen] = React.useState(false);
	if (!editor) return null;

	const current = editor.getAttributes("textStyle")?.color as string | undefined;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					aria-label="Text colour"
					tooltip="Text colour"
					data-active-state={current ? "on" : "off"}
				>
					<span className="tiptap-color-indicator">
						<Baseline className="tiptap-button-icon" />
						<span
							className="tiptap-color-bar"
							style={{ backgroundColor: current || "currentColor" }}
						/>
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="tiptap-color-popover">
				<PaletteGrid
					value={current}
					onSelect={(color) => {
						editor.chain().focus().setColor(color).run();
						setOpen(false);
					}}
				/>
				<button
					type="button"
					className="tiptap-color-reset"
					onClick={() => {
						editor.chain().focus().unsetColor().run();
						setOpen(false);
					}}
				>
					<Ban className="size-3.5" />
					Reset colour
				</button>
			</PopoverContent>
		</Popover>
	);
}

export function HighlightColorPopover() {
	const { editor } = useTiptapEditor();
	const [open, setOpen] = React.useState(false);
	if (!editor) return null;

	const current = editor.getAttributes("highlight")?.color as string | undefined;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					aria-label="Highlight colour"
					tooltip="Highlight colour"
					data-active-state={editor.isActive("highlight") ? "on" : "off"}
				>
					<span className="tiptap-color-indicator">
						<Highlighter className="tiptap-button-icon" />
						<span
							className="tiptap-color-bar"
							style={{ backgroundColor: current || "currentColor" }}
						/>
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="tiptap-color-popover">
				<PaletteGrid
					value={current}
					onSelect={(color) => {
						editor.chain().focus().setHighlight({ color }).run();
						setOpen(false);
					}}
				/>
				<button
					type="button"
					className="tiptap-color-reset"
					onClick={() => {
						editor.chain().focus().unsetHighlight().run();
						setOpen(false);
					}}
				>
					<Ban className="size-3.5" />
					Remove highlight
				</button>
			</PopoverContent>
		</Popover>
	);
}
