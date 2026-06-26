import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { Subject } from "@/shared/models/subject.model";
import { useLocale } from "next-intl";
import { getLocalizedName } from "@/shared/utils/localization";
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Badge } from "@/shared/components/ui/badge";
import { XIcon } from "lucide-react";

interface SubjectSelectionProps {
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	className?: string;
}

export default function SubjectSelection({
	value = [],
	onChange,
	placeholder = "Select subjects...",
	className,
}: SubjectSelectionProps) {
	const { data: subjectResponse, isLoading } = useSWR("/subjects/active-list");
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState("");
	const locale = useLocale();
	const inputRef = React.useRef<HTMLInputElement>(null);

	const subjects = Array.isArray(subjectResponse?.data) ? subjectResponse.data : subjectResponse || [];
	const serializedSubjects = subjects?.map((s: any) => new Subject(s)) || [];

	const handleUnselect = (subjectId: string) => {
		onChange(value.filter((id) => id !== subjectId));
	};

	return (
		<div className={cn("w-full", className)}>
			{isLoading ? (
				<Skeleton className="h-10 w-full rounded-md" />
			) : (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<div
							role="combobox"
							aria-expanded={open}
							className={cn(
								"flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-text focus-within:ring-1 focus-within:ring-ring focus-within:border-primary",
								"bg-input/30"
							)}
							onClick={() => {
								setOpen(true);
								inputRef.current?.focus();
							}}
						>
							{value.map((subjectId) => {
								const subject = serializedSubjects.find((s: Subject) => s.id === subjectId);
								return (
									<Badge key={subjectId} variant="secondary" className="rounded-sm px-1.5 py-0.5 font-normal bg-muted">
										{subject ? getLocalizedName(subject.name, locale) : subjectId}
										<button
											className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													handleUnselect(subjectId);
												}
											}}
											onMouseDown={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											onClick={() => handleUnselect(subjectId)}
										>
											<XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
										</button>
									</Badge>
								);
							})}
							<input
								ref={inputRef}
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
										const newSelected = [...value];
										newSelected.pop();
										onChange(newSelected);
									}
								}}
								className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
								placeholder={value.length === 0 ? placeholder : ""}
							/>
						</div>
					</PopoverTrigger>
					<PopoverContent 
						className="w-[--radix-popover-trigger-width] p-0" 
						align="start" 
						onOpenAutoFocus={(e) => e.preventDefault()}
					>
						<Command shouldFilter={false}>
							<CommandList>
								{serializedSubjects.filter((s: Subject) => getLocalizedName(s.name, locale).toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s.id)).length === 0 ? (
									<CommandEmpty>No subjects found.</CommandEmpty>
								) : (
									<CommandGroup>
										{serializedSubjects
											.filter((s: Subject) => getLocalizedName(s.name, locale).toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s.id))
											.map((subject: Subject) => (
												<CommandItem
													key={subject.id}
													value={subject.id}
													onSelect={() => {
														setInputValue("");
														onChange([...value, subject.id]);
														// keep open for multiple selection
													}}
													className="cursor-pointer"
												>
													{getLocalizedName(subject.name, locale)}
												</CommandItem>
											))}
									</CommandGroup>
								)}
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
