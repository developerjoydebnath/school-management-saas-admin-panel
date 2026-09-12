"use client";

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
import { CheckIcon, ChevronDownIcon, X } from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";

interface TeacherMultiSelectionProps {
	value: string[];
	onChange: (value: string[]) => void;
	className?: string;
	placeholder?: string;
}

export default function TeacherMultiSelection({
	value,
	onChange,
	className,
	placeholder = "Select invigilators...",
}: TeacherMultiSelectionProps) {
	const { data: teachersRes, isLoading } = useSWR("/staff/teachers/short-list");
	const [open, setOpen] = React.useState(false);
	const locale = useLocale();

	const teachers = teachersRes?.data || teachersRes || [];
	const serializedTeachers = teachers.map((teacher: any) => new Teacher(teacher));
	const selectedTeachers = serializedTeachers.filter((teacher: Teacher) =>
		value.includes(teacher.id)
	);

	const toggleTeacher = (teacherId: string) => {
		onChange(
			value.includes(teacherId)
				? value.filter((id) => id !== teacherId)
				: [...value, teacherId]
		);
	};

	const removeTeacher = (teacherId: string) => {
		onChange(value.filter((id) => id !== teacherId));
	};

	const getTeacherSubjects = (teacher: Teacher) => {
		const original = teacher.original || {};
		const subjects = [
			original.primarySubject,
			...(Array.isArray(original.specializationSubjectItems)
				? original.specializationSubjectItems
				: []),
		].filter(Boolean);
		const seen = new Set<string>();
		const labels = subjects
			.map((subject) => {
				const label = getLocalizedName(
					{
						en: subject.enName || subject.name?.en || subject.name || subject.code || "",
						bn: subject.bnName || subject.name?.bn || subject.enName || subject.name || subject.code || "",
					},
					locale
				);
				const key = subject.id || label.toLowerCase();
				if (!label || seen.has(key)) return "";
				seen.add(key);
				return label;
			})
			.filter(Boolean);

		return labels.length ? labels.join(", ") : "No subject assigned";
	};

	return (
		<div className={cn("w-full space-y-1.5", className)}>
			{isLoading ? (
				<Skeleton className="h-9 w-full rounded-md" />
			) : (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={open}
							className="bg-input/30 hover:bg-input/50 h-9! w-full justify-between text-sm font-normal"
						>
							<span className="truncate">
								{selectedTeachers.length
									? `${selectedTeachers.length} invigilator${selectedTeachers.length > 1 ? "s" : ""}`
									: placeholder}
							</span>
							<ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
						<Command>
							<CommandInput placeholder="Search teachers..." />
							<CommandList>
								<CommandEmpty>No teachers found.</CommandEmpty>
								<CommandGroup>
									{serializedTeachers.map((teacher: Teacher) => {
										const selected = value.includes(teacher.id);
										const teacherName = getLocalizedName(teacher.name, locale);
										return (
											<CommandItem
												key={teacher.id}
												value={teacherName}
												onSelect={() => toggleTeacher(teacher.id)}
											>
												<CheckIcon
													className={cn(
														"h-4 w-4",
														selected ? "opacity-100" : "opacity-0"
													)}
												/>
												<div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
													<Avatar className="size-8">
														<AvatarFallback>
															{teacherName?.substring(0, 2).toUpperCase() || "?"}
														</AvatarFallback>
													</Avatar>
													<div className="flex min-w-0 flex-1 flex-col">
														<span className="truncate font-medium">{teacherName}</span>
														<span className="text-muted-foreground line-clamp-1 text-xs">
															{getTeacherSubjects(teacher)}
														</span>
													</div>
												</div>
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			)}

			{selectedTeachers.length ? (
				<div className="flex flex-wrap gap-1">
					{selectedTeachers.map((teacher: Teacher) => (
						<span
							key={teacher.id}
							className="bg-muted text-muted-foreground inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs"
						>
							<span className="max-w-32 truncate">
								{getLocalizedName(teacher.name, locale)}
							</span>
							<button
								type="button"
								className="hover:text-foreground"
								onClick={() => removeTeacher(teacher.id)}
								aria-label="Remove invigilator"
							>
								<X className="h-3 w-3" />
							</button>
						</span>
					))}
				</div>
			) : null}
		</div>
	);
}
