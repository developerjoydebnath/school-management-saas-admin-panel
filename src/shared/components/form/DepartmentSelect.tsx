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

interface DepartmentSelectProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export default function DepartmentSelect({
	value,
	onChange,
	placeholder = "Select Department",
	className,
	disabled,
}: DepartmentSelectProps) {
	const { data: response, isLoading } = useSWR("/departments/active-list");
	const departments = response?.data || response || [];

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
				{departments.map((department: any) => (
					<SelectItem key={department.id} value={department.id} className="cursor-pointer py-2">
						{department.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
