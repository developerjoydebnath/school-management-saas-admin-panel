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
	onOptionChange?: (option: any | null) => void;
	sessionId?: string;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export default function ClassSelect({
	value,
	onChange,
	onOptionChange,
	sessionId,
	placeholder = "Select Class",
	className,
	disabled = false,
}: ClassSelectProps) {
	const { data: response, isLoading } = useSWR("/classes/active-list", { sessionId });
	const locale = useLocale();
	const classes = response?.data || response || [];

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select
			value={value?.toString() || undefined}
			onValueChange={(selectedValue) => {
				onChange(selectedValue);
				onOptionChange?.(
					classes?.find(
						(cls: any) => cls.id?.toString() === selectedValue?.toString()
					) || null
				);
			}}
			disabled={disabled}
		>
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
							: cls.name || cls.enName}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
