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
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";

export type StudentPaymentOption = {
	value: string;
	label: string;
	name?: string;
	studentIdNo?: string;
	sessionId?: string | null;
	classId?: string;
	sectionId?: string;
	className?: string | null;
	sectionName?: string | null;
	[key: string]: unknown;
};

interface StudentPaymentComboboxProps {
	value: string;
	onChange: (value: string, option?: StudentPaymentOption) => void;
	placeholder?: string;
	disabled?: boolean;
	/**
	 * Fallback trigger label used when `value` isn't among the currently
	 * loaded/searched options (e.g. editing a payment whose student isn't in
	 * the current search results) so the field never renders blank while
	 * disabled.
	 */
	selectedLabel?: string;
	className?: string;
}

// Same 500ms default this codebase's own DebouncedInput (@/shared/components/ui/debounced-input)
// uses, kept consistent here even though CommandInput's controlled-value API
// isn't a drop-in fit for that component.
const DEBOUNCE_MS = 500;
const MIN_SEARCH_LENGTH = 3;

const listFromResponse = (response: any) => {
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response)) return response;
	return [];
};

export default function StudentPaymentCombobox({
	value,
	onChange,
	placeholder = "Select student",
	disabled,
	selectedLabel,
	className,
}: StudentPaymentComboboxProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [search]);

	const trimmedSearch = debouncedSearch.trim();
	const hasEnoughInput = trimmedSearch.length >= MIN_SEARCH_LENGTH;

	// Nothing loads until the user actually types -- no default "browse
	// everyone" list, and no query fired below the 3-character floor.
	const { data: response, isLoading } = useSWR(
		open && hasEnoughInput ? "/students/options" : null,
		hasEnoughInput ? { search: trimmedSearch, limit: 20 } : undefined
	);
	const { data: sessionsRes } = useSWR(open ? "/sessions/active-list" : null);
	const sessions = listFromResponse(sessionsRes);
	const sessionLabelById = new Map(
		sessions.map((session: any) => [session.id, session.name])
	);

	const options: StudentPaymentOption[] = listFromResponse(response);

	const selectedOption = options.find((option) => option.value === value);
	const triggerLabel = selectedOption?.label || (value ? selectedLabel : undefined) || placeholder;
	const hasLabel = !!selectedOption || (!!value && !!selectedLabel);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"bg-input/30 hover:bg-input/50 h-10 w-full justify-between font-normal",
						!hasLabel && "text-muted-foreground",
						className
					)}
				>
					<span className="truncate">{triggerLabel}</span>
					<ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
				align="start"
				onWheelCapture={(event) => event.stopPropagation()}
				onTouchMoveCapture={(event) => event.stopPropagation()}
			>
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search by name or ID..."
						value={search}
						onValueChange={setSearch}
					/>
					<ScrollArea className="max-h-72 overflow-hidden" viewportClassName="h-auto max-h-72">
						<CommandList className="max-h-none overflow-visible">
							<CommandEmpty className="text-muted-foreground px-3 py-6 text-center text-sm">
								{!hasEnoughInput
									? `Type at least ${MIN_SEARCH_LENGTH} characters to search`
									: isLoading
										? "Searching..."
										: "No students found."}
							</CommandEmpty>
							<CommandGroup>
								{options.map((option) => {
									const classSection = [option.className, option.sectionName]
										.filter(Boolean)
										.join(" - ");
									const sessionLabel = option.sessionId
										? (sessionLabelById.get(option.sessionId) as string | undefined)
										: undefined;

									return (
										<CommandItem
											key={option.value}
											value={option.value}
											className="items-start gap-2 py-2"
											onSelect={() => {
												const nextValue = option.value === value ? "" : option.value;
												onChange(nextValue, nextValue ? option : undefined);
												setOpen(false);
											}}
										>
											<CheckIcon
												className={cn(
													"text-foreground mt-0.5 h-4 w-4 shrink-0",
													value === option.value ? "opacity-100" : "opacity-0"
												)}
											/>
											<div className="min-w-0 flex-1 space-y-0.5">
												<p className="truncate text-sm leading-tight font-medium">
													{option.name}
													{classSection ? (
														<span className="text-muted-foreground font-normal">
															{" "}
															&middot; {classSection}
														</span>
													) : null}
												</p>
												<p className="text-muted-foreground truncate text-xs leading-tight">
													{[sessionLabel, option.studentIdNo].filter(Boolean).join(" · ")}
												</p>
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
