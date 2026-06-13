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

interface ClassSelectProps {
	value: string;
	onChange: (value: string | null) => void;
	placeholder?: string;
	className?: string;
}

export default function ClassSelect({
	value,
	onChange,
	placeholder = "Select Class",
	className,
}: ClassSelectProps) {
	const { data: classes, isLoading } = useSWR("/classes");
	const locale = useLocale();

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select value={value?.toString() || null} onValueChange={onChange}>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{classes?.map((cls: any) => (
					<SelectItem
						key={cls.id}
						value={cls.id.toString()}
						className="cursor-pointer py-2"
					>
						{typeof cls.name === "object"
							? getLocalizedName(cls.name, locale)
							: cls.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
