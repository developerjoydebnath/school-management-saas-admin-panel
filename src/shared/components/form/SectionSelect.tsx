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
import { getLocalizedName } from "@/shared/utils/localization";
import { useLocale } from "next-intl";
import { useMemo } from "react";

interface SectionSelectProps {
	value: string;
	onChange: (value: string | null) => void;
	classId?: string;
	placeholder?: string;
	className?: string;
}

export default function SectionSelect({
	value,
	onChange,
	classId,
	placeholder = "Select Section",
	className,
}: SectionSelectProps) {
	const { data: classes, isLoading } = useSWR("/classes");
	const locale = useLocale();

	const sections = useMemo(() => {
		if (!classId || !classes) return [];
		const selectedClass = classes.find((c: any) => c.id === classId);
		return selectedClass?.sections || [];
	}, [classId, classes]);

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select value={value?.toString() || null} onValueChange={onChange} disabled={!classId}>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={!classId ? "Select a class first" : placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{sections.map((section: any) => (
					<SelectItem
						key={section.name}
						value={section.name}
						className="cursor-pointer py-2"
					>
						{typeof section.name === "object"
							? getLocalizedName(section.name, locale)
							: section.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
