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
import { Subject } from "@/shared/models/subject.model";
import { getLocalizedName } from "@/shared/utils/localization";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useLocale } from "next-intl";
import * as React from "react";

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
	const { data: response, isLoading } = useSWR("/subjects/active-list");
	const [open, setOpen] = React.useState(false);
	const locale = useLocale();

	const subjects = response?.data || response || [];
	const serializedSubjects = subjects.map((s: any) => new Subject(s));
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
							className="bg-input/30 hover:bg-input/50 h-10 w-full justify-between font-normal"
						>
							<span className="truncate">
								{selectedSubject
									? getLocalizedName(selectedSubject.name, locale)
									: placeholder}
							</span>
							<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
						align="start"
						onWheelCapture={(event) => event.stopPropagation()}
						onTouchMoveCapture={(event) => event.stopPropagation()}
					>
						<Command>
							<CommandInput placeholder="Search subjects..." />
							<ScrollArea
								className="max-h-56 overflow-hidden"
								viewportClassName="h-auto max-h-56"
							>
								<CommandList className="max-h-none overflow-visible">
									<CommandEmpty>No subjects found.</CommandEmpty>
									<CommandGroup>
										{serializedSubjects.map((subject: Subject) => (
											<CommandItem
												key={subject.id}
												value={getLocalizedName(subject.name, locale)}
												onSelect={() => {
													onChange(
														subject.id === value ? "" : subject.id
													);
													setOpen(false);
												}}
											>
												<CheckIcon
													className={cn(
														"text-foreground mr-2 h-4 w-4",
														value === subject.id
															? "opacity-100"
															: "opacity-0"
													)}
												/>
												{getLocalizedName(subject.name, locale)}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</ScrollArea>
						</Command>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
