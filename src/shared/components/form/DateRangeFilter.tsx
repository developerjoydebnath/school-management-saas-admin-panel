"use client";

import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "./DateRangePicker";

type Props = {
	title: string;
	from?: string;
	to?: string;
	onChange: (value: { from: string; to: string }) => void;
};

const parseDateValue = (value?: string) => {
	if (!value) return undefined;
	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) return undefined;
	return new Date(year, month - 1, day);
};

const formatDateValue = (date?: Date) => {
	if (!date) return "";
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export default function DateRangeFilter({ title, from, to, onChange }: Props) {
	const dateRange: DateRange | undefined =
		from || to
			? {
					from: parseDateValue(from),
					to: parseDateValue(to),
				}
			: undefined;

	return (
		<div className="flex-1">
			<label className="text-muted-foreground mb-2 block w-full text-xs font-medium">
				{title}
			</label>
			<div className="relative">
				<DateRangePicker
					value={dateRange}
					align="start"
					className="h-9 justify-start pr-10"
					onValueChange={(date) =>
						onChange({
							from: formatDateValue(date?.from),
							to: formatDateValue(date?.to),
						})
					}
				/>
				{(from || to) && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
						onClick={() => onChange({ from: "", to: "" })}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
