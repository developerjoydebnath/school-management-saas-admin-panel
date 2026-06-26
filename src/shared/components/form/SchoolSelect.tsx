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

interface SchoolSelectProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export default function SchoolSelect({
	value,
	onChange,
	placeholder = "Select school",
	className,
}: SchoolSelectProps) {
	const { data, isLoading } = useSWR("/superadmin/schools", {
		page: 1,
		limit: 100,
	});

	const schools = data?.data?.items || [];
	const options = schools.map((school: any) => ({
		label: school.schoolName,
		value: school.id,
	}));

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select value={value?.toString() || undefined} onValueChange={onChange}>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{options.map((school: { label: string; value: string }) => (
					<SelectItem
						key={school.value}
						value={school.value}
						className="cursor-pointer py-2"
					>
						{school.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
