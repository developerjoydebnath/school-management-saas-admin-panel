"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

type ClassRoom = {
	id: string;
	roomNo?: string;
	name?: string;
};

interface ClassRoomComboboxProps {
	value: string;
	onChange: (value: string, room?: ClassRoom) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	disabled?: boolean;
}

export default function ClassRoomCombobox({
	value,
	onChange,
	placeholder = "Select room",
	searchPlaceholder = "Search rooms...",
	emptyMessage = "No rooms found.",
	className,
	disabled,
}: ClassRoomComboboxProps) {
	const { data: response, isLoading } = useSWR("/class-rooms/active-list");
	const [open, setOpen] = useState(false);
	const rooms: ClassRoom[] = response?.data || response || [];
	const selectedRoom = rooms.find((room) => room.id === value);

	if (isLoading) return <Skeleton className="h-10 w-full rounded-md" />;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"bg-input/30 hover:bg-input/50 h-10 w-full justify-between font-normal",
						className
					)}
				>
					<span className="truncate">
						{selectedRoom
							? `${selectedRoom.roomNo} - ${selectedRoom.name}`
							: placeholder}
					</span>
					<ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
				align="start"
				onWheelCapture={(event) => event.stopPropagation()}
				onTouchMoveCapture={(event) => event.stopPropagation()}
			>
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<ScrollArea
						className="max-h-56 overflow-hidden"
						viewportClassName="h-auto max-h-56"
					>
						<CommandList className="max-h-none overflow-visible">
							<CommandEmpty>{emptyMessage}</CommandEmpty>
							<CommandGroup>
								{rooms.map((room) => (
									<CommandItem
										key={room.id}
										value={`${room.roomNo} ${room.name}`}
										onSelect={() => {
											const nextValue = room.id === value ? "" : room.id;
											onChange(nextValue, nextValue ? room : undefined);
											setOpen(false);
										}}
									>
										<CheckIcon
											className={cn(
												"text-foreground h-4 w-4",
												value === room.id ? "opacity-100" : "opacity-0"
											)}
										/>
										<span className="truncate">
											{room.roomNo} - {room.name}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</ScrollArea>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
