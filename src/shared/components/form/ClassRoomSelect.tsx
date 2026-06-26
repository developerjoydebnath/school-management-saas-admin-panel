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

interface ClassRoomSelectProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export default function ClassRoomSelect({
	value,
	onChange,
	placeholder = "Select Class Room",
	className,
	disabled,
}: ClassRoomSelectProps) {
	const { data: response, isLoading } = useSWR("/class-rooms/active-list");
	const rooms = response?.data || response || [];

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
				{rooms.map((room: any) => (
					<SelectItem key={room.id} value={room.id} className="cursor-pointer py-2">
						{room.roomNo} - {room.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
