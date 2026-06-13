import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from "@/shared/components/ui/combobox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { Teacher } from "@/shared/models/teacher.model";
import { useLocale } from "next-intl";
import { getLocalizedName } from "@/shared/utils/localization";
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
	const { data: teachers, isLoading: isTeachersLoading } = useSWR("/teachers");
	const { data: subjects, isLoading: isSubjectsLoading } = useSWR("/subjects");
	const isLoading = isTeachersLoading || isSubjectsLoading;

	const [searchValue, setSearchValue] = React.useState("");
	const [open, setOpen] = React.useState(false);
	const anchor = useComboboxAnchor();
	const locale = useLocale();

	const serializedTeachers = teachers?.map((t: any) => new Teacher(t)) || [];
	const selectedTeacher = serializedTeachers.find((t: Teacher) => t.id === value);

	React.useEffect(() => {
		if (selectedTeacher) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSearchValue(getLocalizedName(selectedTeacher.name, locale));
		} else {
			setSearchValue("");
		}
	}, [selectedTeacher]);

	const filteredTeachers = serializedTeachers.filter((teacher: Teacher) =>
		getLocalizedName(teacher.name, locale)
			.toLowerCase()
			.includes(searchValue.toLowerCase())
	);

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
				<Combobox
					open={open}
					onOpenChange={(newOpen) => {
						setOpen(newOpen);
						if (!newOpen) {
							setSearchValue(getLocalizedName(selectedTeacher?.name, locale) || "");
						} else {
							setSearchValue("");
						}
					}}
					value={value}
					onValueChange={(val) => {
						onChange(val || "");
						setOpen(false);
					}}
				>
					<div ref={anchor}>
						<ComboboxInput
							placeholder={placeholder}
							value={searchValue}
							onChange={(e: any) => {
								setSearchValue(e.target.value);
								setOpen(true);
							}}
							onFocus={() => {
								if (!open) {
									setOpen(true);
									setSearchValue("");
								}
							}}
							className="text-sm"
							showClear
						/>
					</div>

					<ComboboxContent
						anchor={anchor}
						className="w-(--anchor-width) min-w-[300px] p-1"
					>
						<ComboboxList>
							{filteredTeachers.length === 0 ? (
								<ComboboxEmpty>No teachers found.</ComboboxEmpty>
							) : (
								filteredTeachers.map((teacher: Teacher) => (
									<ComboboxItem
										key={teacher.id}
										value={teacher.id}
										className="cursor-pointer"
									>
										<div className="flex items-center gap-3">
											<Avatar className="size-8">
												<AvatarFallback>
													{getLocalizedName(teacher.name, locale)
														?.substring(0, 2)
														.toUpperCase() || "?"}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="font-medium">
													{getLocalizedName(teacher.name, locale)}
												</span>
												<span className="text-muted-foreground line-clamp-1 text-xs">
													{getSubjectNames(teacher.subjects)}
												</span>
											</div>
										</div>
									</ComboboxItem>
								))
							)}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			)}
		</div>
	);
}
