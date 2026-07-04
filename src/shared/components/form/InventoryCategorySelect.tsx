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

export default function InventoryCategorySelect({
	value,
	onChange,
	placeholder = "Select inventory category",
	className,
	disabled,
}: Props) {
	const { data: response, isLoading } = useSWR("/inventory/categories", {
		page: 1,
		limit: 100,
	});
	const categories = response?.data?.items || response?.items || [];

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
				{categories.map((category: any) => (
					<SelectItem key={category.id} value={category.id} className="cursor-pointer py-2">
						{category.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
