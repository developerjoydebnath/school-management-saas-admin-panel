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

export default function InventoryItemSelect({
	value,
	onChange,
	placeholder = "Select inventory item",
	className,
	disabled,
}: Props) {
	const { data: response, isLoading } = useSWR("/inventory/items", {
		page: 1,
		limit: 100,
	});
	const items = response?.data?.items || response?.items || [];

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
				{items.map((item: any) => (
					<SelectItem key={item.id} value={item.id} className="cursor-pointer py-2">
						{item.code ? `${item.code} - ${item.name}` : item.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
