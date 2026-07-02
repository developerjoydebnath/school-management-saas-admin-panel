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

interface ExamSelectProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	sessionId?: string;
	classId?: string;
	disabled?: boolean;
}

export default function ExamSelect({
	value,
	onChange,
	placeholder = "Select exam",
	className,
	sessionId,
	classId,
	disabled,
}: ExamSelectProps) {
	const { data: response, isLoading } = useSWR("/exams/active-list", {
		sessionId,
		classId,
	});
	const exams = response?.data || response || [];

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select
			value={value || undefined}
			onValueChange={onChange}
			disabled={disabled}
		>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{exams.map((exam: any) => (
					<SelectItem key={exam.id} value={exam.id} className="cursor-pointer py-2">
						{exam.name} ({exam.type?.replaceAll("_", " ").toLowerCase()})
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
