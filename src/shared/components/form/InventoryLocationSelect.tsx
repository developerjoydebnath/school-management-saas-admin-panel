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

type Props = {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
};

export default function InventoryLocationSelect({
	value,
	onChange,
	placeholder = "Select inventory location",
	className,
	disabled,
}: Props) {
	const { data: response, isLoading } = useSWR("/inventory/locations/options");
	const locations = response?.data || [];

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
				{locations.map((location: any) => (
					<SelectItem key={location.value} value={location.value} className="cursor-pointer py-2">
						{location.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
