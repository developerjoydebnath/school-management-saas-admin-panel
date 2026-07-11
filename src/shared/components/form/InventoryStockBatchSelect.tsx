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

export default function InventoryStockBatchSelect({
	value,
	onChange,
	placeholder = "Select stock batch",
	className,
	disabled,
}: Props) {
	const { data: response, isLoading } = useSWR("/inventory/stock-batches/options");
	const batches = response?.data || [];

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
				{batches.map((batch: any) => (
					<SelectItem key={batch.value} value={batch.value} className="cursor-pointer py-2">
						{batch.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
