"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
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
};

export default function FilterButton({
	title,
	selected,
	onSelect,
	options,
	clearFilter,
	className,
	wrapperClassName,
}: FilterButtonProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [dropUp, setDropUp] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const DROPDOWN_HEIGHT = 280; // approximate max height of the dropdown

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
		const updatedSelectedOptions = exists
			? selected.filter((val) => val !== opt.value)
			: [...selected, opt.value];

		onSelect?.(updatedSelectedOptions);
	};

	const resetFilter = (e: MouseEvent<HTMLSpanElement>) => {
		e.stopPropagation();
		e.preventDefault();
		clearFilter();
		setOpen(false);
	};

	const toggleOpen = (e: MouseEvent) => {
		e.stopPropagation();
		if (!open && triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			// Flip upward if there's not enough space below
			setDropUp(spaceBelow < DROPDOWN_HEIGHT && rect.top > spaceBelow);
		}
		setOpen((prev) => !prev);
	};

	return (
		<div className={cn("flex-1", wrapperClassName)} ref={containerRef}>
			<label className="text-muted-foreground mb-2 block w-full text-xs font-medium">
				{title}
			</label>

			{/* Relative wrapper scoped to the button only — so top/bottom-full anchors to the button, not the label */}
			<div className="relative">
				{/* Trigger */}
				<button
					ref={triggerRef}
					type="button"
					onClick={toggleOpen}
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
					<Badge variant="secondary" className="bg-gray-50 px-1.5 text-gray-700">
						{selected.length}
					</Badge>
					<Badge
						onClick={resetFilter}
						variant="secondary"
						className="aspect-square cursor-pointer rounded-full bg-gray-50 p-1 text-gray-700 hover:bg-gray-200 active:bg-gray-100"
					>
						<IconX size={12} />
					</Badge>
				</button>

				{/* Dropdown — rendered in the normal DOM flow, no Portal */}
				{open && (
					<>
						{/* Invisible overlay to close on outside click */}
						<div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />

						<div
							className={cn(
								"border-border bg-popover absolute left-0 z-[100] w-full overflow-hidden rounded-md border shadow-md",
								dropUp ? "bottom-full mb-1" : "top-full mt-1"
							)}
						>
							{/* Search */}
							<div className="border-border flex items-center gap-2 border-b px-2 py-1.5">
								<IconSearch size={14} className="text-muted-foreground shrink-0" />
								<input
									autoFocus
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
												<Checkbox
													checked={isSelected}
													className="pointer-events-none"
												/>
												<span>{opt.label}</span>
												{isSelected && (
													<IconCheck
														size={14}
														className="text-primary ml-auto"
													/>
												)}
											</div>
										);
									})
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
