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
import { useEffect, useMemo } from "react";

interface SectionSelectProps {
	value: string;
	onChange: (value: string | null) => void;
	onOptionChange?: (option: any | null) => void;
	classId?: string;
	sessionId?: string;
	placeholder?: string;
	className?: string;
}

export default function SectionSelect({
	value,
	onChange,
	onOptionChange,
	classId,
	sessionId,
	placeholder = "Select Section",
	className,
}: SectionSelectProps) {
	const endpoint =
		classId && sessionId
			? "/session-class-sections/setup"
			: classId
				? "/classes/sections/active-list"
				: null;

	const { data: response, isLoading } = useSWR(
		endpoint,
		classId && sessionId ? { classId, sessionId } : { classId }
	);
	const locale = useLocale();
	const sections = useMemo(() => {
		const payload = response?.data || response;

		if (Array.isArray(payload?.items)) {
			return payload.items
				.filter((item: any) => item?.status === "ACTIVE" && item?.section?.id)
				.map((item: any) => ({
					id: item.section.id,
					name: item.section.name,
					bnName: item.section.bnName,
					label: item.section.name,
					setupId: item.id,
					shiftId: item.shiftId,
					roomId: item.roomId,
				}));
		}

		return Array.isArray(payload) ? payload : [];
	}, [response]);

	useEffect(() => {
		if (isLoading || !value) return;
		if (!sections.some((section: any) => section.id === value)) {
			onChange(null);
			onOptionChange?.(null);
		}
	}, [isLoading, onChange, onOptionChange, sections, value]);

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select
			value={value?.toString() || undefined}
			onValueChange={(selectedValue) => {
				onChange(selectedValue);
				onOptionChange?.(
					sections.find(
						(section: any) => section.id?.toString() === selectedValue?.toString()
					) || null
				);
			}}
			disabled={!classId}
		>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={!classId ? "Select a class first" : placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{sections.map((section: any) => (
					<SelectItem
						key={section.id || section.name}
						value={section.id}
						className="cursor-pointer py-2"
					>
						{typeof (section.label || section.name) === "object"
							? getLocalizedName(section.label || section.name, locale)
							: section.label || section.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
