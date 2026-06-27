import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { Subject } from "@/shared/models/subject.model";
import { useLocale } from "next-intl";
import { getLocalizedName } from "@/shared/utils/localization";
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Button } from "@/shared/components/ui/button";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

interface SubjectSingleSelectionProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
	placeholder?: string;
}

export default function SubjectSingleSelection({
	value,
	onChange,
	className,
	placeholder = "Select subject...",
}: SubjectSingleSelectionProps) {
	const { data: subjects, isLoading } = useSWR("/subjects");
	const [open, setOpen] = React.useState(false);
	const locale = useLocale();

	const serializedSubjects = subjects?.map((s: any) => new Subject(s)) || [];
	const selectedSubject = serializedSubjects.find((s: Subject) => s.id === value);

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
							className="w-full justify-between font-normal bg-input/30 hover:bg-input/50"
						>
							<span className="truncate">
								{selectedSubject ? getLocalizedName(selectedSubject.name, locale) : placeholder}
							</span>
							<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
						<Command>
							<CommandInput placeholder="Search subjects..." />
							<CommandList>
								<CommandEmpty>No subjects found.</CommandEmpty>
								<CommandGroup>
									{serializedSubjects.map((subject: Subject) => (
										<CommandItem
											key={subject.id}
											value={getLocalizedName(subject.name, locale)}
											onSelect={() => {
												onChange(subject.id === value ? "" : subject.id);
												setOpen(false);
											}}
										>
											<CheckIcon
												className={cn(
													"mr-2 h-4 w-4",
													value === subject.id ? "opacity-100" : "opacity-0"
												)}
											/>
											{getLocalizedName(subject.name, locale)}
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
