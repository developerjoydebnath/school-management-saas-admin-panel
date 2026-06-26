"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";

interface ShiftSelectProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export default function ShiftSelect({
	value,
	onChange,
	placeholder = "Select Shift",
	className,
	disabled,
}: ShiftSelectProps) {
	const { data: response, isLoading } = useSWR("/shifts/active-list");
	const shifts = response?.data || response || [];

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select
			value={value?.toString() || undefined}
			onValueChange={onChange}
			disabled={disabled}
		>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{shifts.map((shift: any) => (
					<SelectItem key={shift.id} value={shift.id} className="cursor-pointer py-2">
						{shift.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
