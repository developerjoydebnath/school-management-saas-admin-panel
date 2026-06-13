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

interface SessionSelectProps {
	value: string;
	onChange: (value: string | null) => void;
	placeholder?: string;
	className?: string;
}

export default function SessionSelect({
	value,
	onChange,
	placeholder = "Select Session",
	className,
}: SessionSelectProps) {
	const { data: sessions, isLoading } = useSWR("/sessions");
	const locale = useLocale();

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select value={value?.toString() || null} onValueChange={onChange}>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{sessions
					?.filter((s: any) => s.status === "ACTIVE")
					.map((session: any) => (
						<SelectItem
							key={session.id}
							value={session.id.toString()}
							className="cursor-pointer py-2"
						>
							{typeof session.name === "object"
								? getLocalizedName(session.name, locale)
								: session.name}
						</SelectItem>
					))}
			</SelectContent>
		</Select>
	);
}
