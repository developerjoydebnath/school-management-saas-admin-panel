import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { Teacher } from "@/shared/models/teacher.model";
import { getLocalizedName } from "@/shared/utils/localization";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";

interface TeacherSelectionProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
	placeholder?: string;
}

export default function TeacherSelection({
	value,
	onChange,
	className,
	placeholder = "Select teacher...",
}: TeacherSelectionProps) {
	const { data: teachersRes, isLoading: isTeachersLoading } = useSWR("/staff/teachers/short-list");
	const { data: subjectsRes, isLoading: isSubjectsLoading } = useSWR("/subjects/active-list");
	const isLoading = isTeachersLoading || isSubjectsLoading;

	const [open, setOpen] = React.useState(false);
	const locale = useLocale();

	const teachers = teachersRes?.data || teachersRes || [];
	const subjects = subjectsRes?.data || subjectsRes || [];

	const serializedTeachers = teachers.map((t: any) => new Teacher(t));
	const selectedTeacher = serializedTeachers.find((t: Teacher) => t.id === value);

	const getSubjectNames = (subjectIds: string[]) => {
		if (!subjectIds || subjectIds.length === 0) return "No subject assigned";
		if (!subjects) return subjectIds.join(", ");

		const names = subjectIds.map((id) => {
			const subject = subjects.find((s: any) => s.id === id);
			return subject ? getLocalizedName(subject.name, locale) : id;
		});

		return names.join(", ");
	};

	return (
		<div className={cn("w-full", className)}>
			{isLoading ? (
				<Skeleton className="h-10 w-full rounded-md" />
			) : (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="bg-input/30 hover:bg-input/50 h-10! w-full justify-between font-normal"
						>
							<span className="truncate">
								{selectedTeacher
									? getLocalizedName(selectedTeacher.name, locale)
									: placeholder}
							</span>
							<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-(--radix-popover-trigger-width) p-0"
						align="start"
					>
						<Command>
							<CommandInput placeholder="Search teachers..." />
							<CommandList>
								<CommandEmpty>No teachers found.</CommandEmpty>
								<CommandGroup>
									{serializedTeachers.map((teacher: Teacher) => (
										<CommandItem
											key={teacher.id}
											value={getLocalizedName(teacher.name, locale)}
											onSelect={() => {
												onChange(teacher.id === value ? "" : teacher.id);
												setOpen(false);
											}}
										>
											<CheckIcon
												className={cn(
													"mr-2 h-4 w-4",
													value === teacher.id
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											<div className="flex w-full items-center gap-3 overflow-hidden">
												<Avatar className="size-8">
													<AvatarFallback>
														{getLocalizedName(teacher.name, locale)
															?.substring(0, 2)
															.toUpperCase() || "?"}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-1 flex-col overflow-hidden">
													<span className="truncate font-medium">
														{getLocalizedName(teacher.name, locale)}
													</span>
													<span className="text-muted-foreground truncate text-xs">
														{getSubjectNames(teacher.subjects)}
													</span>
												</div>
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
