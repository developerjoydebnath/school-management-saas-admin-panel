"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { IconCalendarMonth, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { X } from "lucide-react";
import { useState } from "react";

/**
 * A single-month picker shaped like `FilterButton` and `DateRangeFilter` so the
 * three can sit in one filter grid without a native input breaking the row.
 *
 * The value is the `YYYY-MM` string the API expects, not a Date — a month has
 * no day, and round-tripping it through a Date only invites timezone drift.
 */
type Props = {
	title: string;
	value?: string;
	onChange: (value: string) => void;
	className?: string;
	wrapperClassName?: string;
};

const MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

const parseValue = (value?: string) => {
	const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value || "");
	if (!match) return null;
	return { year: Number(match[1]), month: Number(match[2]) };
};

export default function MonthFilter({
	title,
	value,
	onChange,
	className,
	wrapperClassName,
}: Props) {
	const selected = parseValue(value);
	const [open, setOpen] = useState(false);
	// The visible year is its own state so browsing to another year does not
	// change the selection until a month is actually clicked.
	const [visibleYear, setVisibleYear] = useState(
		selected?.year ?? new Date().getFullYear()
	);

	const label = selected
		? `${MONTH_LABELS[selected.month - 1]} ${selected.year}`
		: "Pick a month";

	const pick = (monthIndex: number) => {
		onChange(`${visibleYear}-${String(monthIndex + 1).padStart(2, "0")}`);
		setOpen(false);
	};

	return (
		<div className={cn("flex-1", wrapperClassName)}>
			<label className="text-muted-foreground mb-2 block w-full text-xs font-medium">
				{title}
			</label>
			<div className="relative">
				<Popover
					open={open}
					onOpenChange={(next) => {
						setOpen(next);
						if (next) setVisibleYear(selected?.year ?? new Date().getFullYear());
					}}
				>
					<PopoverTrigger asChild>
						<Button
							size="lg"
							className={cn(
								"hover:bg-gray-25/5 border-border text-foreground h-9 w-full justify-start border bg-transparent pr-10 text-sm",
								className
							)}
						>
							<IconCalendarMonth className="h-4 w-4 opacity-50" />
							<span className={cn(!selected && "text-muted-foreground")}>{label}</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-64 rounded-[10px] p-3">
						<div className="mb-3 flex items-center justify-between">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-7 w-7"
								onClick={() => setVisibleYear((year) => year - 1)}
								aria-label="Previous year"
							>
								<IconChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm font-medium tabular-nums">{visibleYear}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-7 w-7"
								onClick={() => setVisibleYear((year) => year + 1)}
								aria-label="Next year"
							>
								<IconChevronRight className="h-4 w-4" />
							</Button>
						</div>
						<div className="grid grid-cols-3 gap-1.5">
							{MONTH_LABELS.map((monthLabel, index) => {
								const isSelected =
									selected?.year === visibleYear && selected?.month === index + 1;
								return (
									<Button
										key={monthLabel}
										type="button"
										variant={isSelected ? "default" : "ghost"}
										className="h-8 text-xs font-normal"
										onClick={() => pick(index)}
									>
										{monthLabel}
									</Button>
								);
							})}
						</div>
					</PopoverContent>
				</Popover>
				{selected && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
						onClick={() => onChange("")}
						aria-label={`Clear ${title}`}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
