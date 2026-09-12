"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { IconCheck, IconCirclePlus, IconSearch, IconX } from "@tabler/icons-react";
import { MouseEvent, useMemo, useRef, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

export interface TOption {
	label: string;
	value: string;
}

type FilterButtonProps = {
	title: string;
	selected: string[];
	onSelect?: (values: string[]) => void;
	options: TOption[];
	clearFilter: () => void;
	className?: string;
	wrapperClassName?: string;
	singleSelect?: boolean;
};

export default function FilterButton({
	title,
	selected,
	onSelect,
	options,
	clearFilter,
	className,
	wrapperClassName,
	singleSelect = false,
}: FilterButtonProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);

	const optionMap = useMemo(() => {
		return new Map(options?.map((opt) => [opt.value, opt]));
	}, [options]);

	const filteredOptions = useMemo(() => {
		const all = Array.from(optionMap.values());
		if (!search.trim()) return all;
		return all.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
	}, [optionMap, search]);

	const handleSelection = (opt: TOption) => {
		const exists = selected.includes(opt.value);
		const updatedSelectedOptions = singleSelect
			? exists
				? []
				: [opt.value]
			: exists
				? selected.filter((val) => val !== opt.value)
				: [...selected, opt.value];

		onSelect?.(updatedSelectedOptions);
		if (singleSelect) setOpen(false);
	};

	const resetFilter = (e: MouseEvent<HTMLSpanElement>) => {
		e.stopPropagation();
		e.preventDefault();
		clearFilter();
		setOpen(false);
	};

	return (
		<div className={cn("flex-1", wrapperClassName)}>
			<label className="text-muted-foreground mb-2 block w-full text-xs font-medium">
				{title}
			</label>

			<PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
				{/* Trigger */}
				<PopoverPrimitive.Trigger asChild>
					<button
						type="button"
						className={cn(
							"border-border flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border bg-transparent px-2 text-sm",
							className
						)}
					>
						<div className="flex w-full items-center space-x-1 pr-2">
							<IconCirclePlus
								strokeWidth={1.5}
								className="max-h-3.5 min-h-3.5 max-w-3.5 min-w-3.5"
							/>
							<span className="line-clamp-1">{title}</span>
						</div>

						<Separator orientation="vertical" />
						<Badge variant="outline" className="bg-gray-50 px-1.5 text-gray-700">
							{selected.length}
						</Badge>
						<Badge
							onClick={resetFilter}
							variant="outline"
							className="hover:bg-muted hover:text-muted-foreground aspect-square cursor-pointer rounded-full bg-gray-50 p-1 text-gray-700 dark:hover:bg-gray-100 dark:hover:text-black"
						>
							<IconX size={12} />
						</Badge>
					</button>
				</PopoverPrimitive.Trigger>

				{/* Portal escapes any clipping/scrolling ancestor (e.g. the mobile
				    filter drawer's ScrollArea) and Radix's Popper positioning keeps
				    the dropdown within the viewport instead of a fixed max-height
				    guess, flipping side automatically when there isn't room below. */}
				<PopoverPrimitive.Portal>
					<PopoverPrimitive.Content
						align="start"
						sideOffset={4}
						collisionPadding={8}
						style={{ width: "var(--radix-popover-trigger-width)" }}
						className="border-border bg-popover z-100 max-h-(--radix-popover-content-available-height) overflow-hidden rounded-md border shadow-sm"
						onOpenAutoFocus={(e) => {
							e.preventDefault();
							searchInputRef.current?.focus();
						}}
					>
						{/* Search */}
						<div className="border-border flex items-center gap-2 border-b px-2 py-1.5">
							<IconSearch size={14} className="text-muted-foreground shrink-0" />
							<input
								ref={searchInputRef}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search"
								className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
							/>
						</div>

						{/* Options */}
						<div className="max-h-60 overflow-y-auto p-1">
							{filteredOptions.length === 0 ? (
								<p className="text-muted-foreground py-4 text-center text-sm">
									No available option found.
								</p>
							) : (
								filteredOptions.map((opt) => {
									const isSelected = selected.includes(opt.value);
									return (
										<div
											key={opt.value}
											onClick={(e) => {
												e.stopPropagation();
												handleSelection(opt);
											}}
											className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
										>
											<Checkbox checked={isSelected} className="pointer-events-none" />
											<span>{opt.label}</span>
											{isSelected && (
												<IconCheck size={14} className="text-primary ml-auto" />
											)}
										</div>
									);
								})
							)}
						</div>
					</PopoverPrimitive.Content>
				</PopoverPrimitive.Portal>
			</PopoverPrimitive.Root>
		</div>
	);
}
