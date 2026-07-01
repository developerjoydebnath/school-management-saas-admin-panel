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

interface DesignationSelectProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export default function DesignationSelect({
	value,
	onChange,
	placeholder = "Select Designation",
	className,
	disabled,
}: DesignationSelectProps) {
	const { data: response, isLoading } = useSWR("/designations/active-list");
	const designations = response?.data || response || [];

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
				{designations.map((designation: any) => (
					<SelectItem key={designation.id} value={designation.id} className="cursor-pointer py-2">
						{designation.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
