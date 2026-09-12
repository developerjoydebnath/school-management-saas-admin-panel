"use client";

import {
	Button,
	type ButtonProps,
} from "@/shared/components/form/rich-editor/tiptap-ui-primitive/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/components/form/rich-editor/tiptap-ui-primitive/dropdown-menu";
import { useTiptapEditor } from "@/shared/hooks/use-tiptap-editor";
import {
	Columns3,
	Rows3,
	Table as TableIcon,
	Trash2,
} from "lucide-react";

export interface TableDropdownMenuProps extends Omit<ButtonProps, "type"> {
	/** Controls whether the dropdown traps focus. Matches the other menus. */
	modal?: boolean;
}

/**
 * Table controls for the rich-text toolbar.
 *
 * Every real-world school syllabus we modelled this editor on leans on tables
 * (mark distribution grids, word-meaning columns), so table editing is a
 * first-class toolbar action rather than something reachable only by pasting.
 */
export function TableDropdownMenu({ modal = false, ...props }: TableDropdownMenuProps) {
	const { editor } = useTiptapEditor();

	if (!editor) return null;

	const isInTable = editor.isActive("table");

	const run = (fn: () => void) => () => {
		fn();
		editor.commands.focus();
	};

	return (
		<DropdownMenu modal={modal}>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					data-active-state={isInTable ? "on" : "off"}
					role="button"
					tabIndex={-1}
					aria-label="Table"
					tooltip="Table"
					{...props}
				>
					<TableIcon className="tiptap-button-icon" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-52">
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={run(() =>
							editor
								.chain()
								.focus()
								.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
								.run()
						)}
					>
						<TableIcon className="size-4" />
						Insert table
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().addRowBefore().run())}
					>
						<Rows3 className="size-4" />
						Add row above
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().addRowAfter().run())}
					>
						<Rows3 className="size-4" />
						Add row below
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().deleteRow().run())}
					>
						<Trash2 className="size-4" />
						Delete row
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().addColumnBefore().run())}
					>
						<Columns3 className="size-4" />
						Add column left
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().addColumnAfter().run())}
					>
						<Columns3 className="size-4" />
						Add column right
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().deleteColumn().run())}
					>
						<Trash2 className="size-4" />
						Delete column
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().toggleHeaderRow().run())}
					>
						<Rows3 className="size-4" />
						Toggle header row
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().mergeOrSplit().run())}
					>
						<Columns3 className="size-4" />
						Merge / split cells
					</DropdownMenuItem>
					<DropdownMenuItem
						disabled={!isInTable}
						onClick={run(() => editor.chain().focus().deleteTable().run())}
					>
						<Trash2 className="size-4" />
						Delete table
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
