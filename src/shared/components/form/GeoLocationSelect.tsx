"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";

type GeoLocationSelectProps = {
	value?: string | number | null;
	onChange: (value: number | null) => void;
	placeholder?: string;
	className?: string;
	type: "division" | "district" | "upazila";
	dependencyId?: string | number | null;
	disabled?: boolean;
};

type GeoOption = {
	id: number;
	enName: string;
	bnName: string;
};

export default function GeoLocationSelect({
	value,
	onChange,
	placeholder,
	className,
	type,
	dependencyId,
	disabled,
}: GeoLocationSelectProps) {
	const url =
		type === "division"
			? "/public/locations/divisions"
			: type === "district" && dependencyId
				? `/public/locations/districts/${dependencyId}`
				: type === "upazila" && dependencyId
					? `/public/locations/upazilas/${dependencyId}`
					: null;

	const { data: response, isLoading } = useSWR(url);
	const options: GeoOption[] = Array.isArray(response?.data)
		? response.data
		: Array.isArray(response)
			? response
			: [];

	return (
		<Select
			value={value === undefined || value === null || value === "" ? undefined : String(value)}
			onValueChange={(selected) => onChange(selected ? Number(selected) : null)}
			disabled={disabled || isLoading || (type !== "division" && !dependencyId)}
		>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1" sideOffset={4}>
				{options.map((option) => (
					<SelectItem key={option.id} value={String(option.id)} className="cursor-pointer py-2">
						{option.enName} ({option.bnName})
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
