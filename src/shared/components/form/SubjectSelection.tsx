import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from "@/shared/components/ui/combobox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { Subject } from "@/shared/models/subject.model";
import { useLocale } from "next-intl";
import { getLocalizedName } from "@/shared/utils/localization";
import * as React from "react";

interface SubjectSelectionProps {
	value: string[];
	onChange: (value: string[]) => void;
	className?: string;
}

export default function SubjectSelection({
	value = [],
	onChange,
	className,
}: SubjectSelectionProps) {
	const { data: subjects, isLoading } = useSWR("/subjects");
	const [searchValue, setSearchValue] = React.useState("");
	const anchor = useComboboxAnchor();
	const locale = useLocale();

	const serializedSubjects = subjects?.map((s: any) => new Subject(s)) || [];

	const filteredSubjects = serializedSubjects.filter((subject: Subject) =>
		getLocalizedName(subject.name, locale).toLowerCase().includes(searchValue.toLowerCase())
	);

	const handleSelect = (val: string) => {
		if (value.includes(val)) {
			onChange(value.filter((v) => v !== val));
		} else {
			onChange([...value, val]);
		}
	};

	return (
		<div className={cn("w-full", className)}>
			{isLoading ? (
				<Skeleton className="h-10 w-full rounded-md" />
			) : (
				<Combobox multiple value={value} onValueChange={onChange}>
					<div ref={anchor}>
						<ComboboxChips className="border-input focus-within:border-primary focus-within:ring-primary min-h-10 bg-transparent shadow-none focus-within:ring-1">
							{value.map((val) => {
								const subject = serializedSubjects.find(
									(s: Subject) => s.id === val || s.name === val
								);
								return (
									<ComboboxChip key={val}>
										{subject ? getLocalizedName(subject.name, locale) : val}
									</ComboboxChip>
								);
							})}
							<ComboboxChipsInput
								placeholder={value.length === 0 ? "Select subjects..." : ""}
								value={searchValue}
								onChange={(e: any) => setSearchValue(e.target.value)}
								className="text-sm"
							/>
						</ComboboxChips>
					</div>

					<ComboboxContent
						anchor={anchor}
						className="w-(--anchor-width) min-w-[200px] p-2"
					>
						<ComboboxList>
							{filteredSubjects.length === 0 ? (
								<ComboboxEmpty>No subjects found.</ComboboxEmpty>
							) : (
								filteredSubjects.map((subject: Subject) => (
									<ComboboxItem
										key={subject.id}
										value={subject.id}
										className="cursor-pointer"
									>
										{getLocalizedName(subject.name, locale)}
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
