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
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { getLocalizedName } from "@/shared/utils/localization";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

type SubjectTeacher = {
	id: string;
	fullName: string;
	primarySubject?: {
		enName?: string;
		bnName?: string;
	};
};

interface SubjectTeacherSelectProps {
	subjectId?: string | null;
	value: string;
	onChange: (value: string, teacher?: SubjectTeacher) => void;
	className?: string;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	selectSubjectFirstMessage?: string;
	loadingMessage?: string;
	disabled?: boolean;
}

export default function SubjectTeacherSelect({
	subjectId,
	value,
	onChange,
	className,
	placeholder = "Select teacher",
	searchPlaceholder = "Search teachers...",
	emptyMessage = "No matching teachers found.",
	selectSubjectFirstMessage = "Select subject first",
	loadingMessage = "Loading teachers...",
	disabled,
}: SubjectTeacherSelectProps) {
	const { data: response, isLoading } = useSWR(
		subjectId ? "/timetables/subject-teachers" : null,
		subjectId ? { subjectId } : undefined
	);
	const [open, setOpen] = useState(false);
	const locale = useLocale();
	const teachers: SubjectTeacher[] = response?.data || response || [];
	const selectedTeacher = teachers.find((teacher) => teacher.id === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled || !subjectId || isLoading}
					className={cn(
						"bg-input/30 hover:bg-input/50 h-10 w-full justify-between font-normal",
						className
					)}
				>
					<span className="truncate">
						{!subjectId
							? selectSubjectFirstMessage
							: isLoading
								? loadingMessage
								: selectedTeacher?.fullName || placeholder}
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
								{teachers.map((teacher) => {
									const primarySubjectName = teacher.primarySubject
										? getLocalizedName(
												{
													en: teacher.primarySubject.enName,
													bn: teacher.primarySubject.bnName,
												},
												locale
											)
										: "No primary subject";

									return (
										<CommandItem
											key={teacher.id}
											value={`${teacher.fullName} ${primarySubjectName}`}
											onSelect={() => {
												const nextValue =
													teacher.id === value ? "" : teacher.id;
												onChange(
													nextValue,
													nextValue ? teacher : undefined
												);
												setOpen(false);
											}}
										>
											<CheckIcon
												className={cn(
													"text-foreground h-4 w-4",
													value === teacher.id
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											<div className="min-w-0">
												<div className="truncate">{teacher.fullName}</div>
												<div className="text-muted-foreground truncate text-xs">
													{primarySubjectName}
												</div>
											</div>
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</ScrollArea>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
