"use client";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { IconSearch } from "@tabler/icons-react";
import debounce from "lodash/debounce";
import React, { useEffect, useMemo, useState } from "react";

type SearchInputProps = {
	className?: string;
	value?: string;
	onValueChange?: (val: string) => void;
	debounceDelay?: number;
	placeholder?: string;
};

export default function SearchInput({
	className,
	value = "",
	onValueChange,
	debounceDelay = 500,
	...props
}: SearchInputProps) {
	const [inputValue, setInputValue] = useState(value);

	// Sync internal state when `value` prop changes (for controlled usage)
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setInputValue(value);
	}, [value]);

	// Create a debounced version of onValueChange
	const debouncedOnValueChange = useMemo(
		() =>
			debounce((val: string) => {
				onValueChange?.(val);
			}, debounceDelay),
		[onValueChange, debounceDelay]
	);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedOnValueChange.cancel();
		};
	}, [debouncedOnValueChange]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		debouncedOnValueChange(newValue);
	};

	return (
		<div className={cn("relative h-9 w-full", className)}>
			<IconSearch className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400" />
			<Input
				className="h-full pl-10 shadow-none"
				placeholder={props.placeholder || "Search"}
				value={inputValue}
				onChange={handleChange}
				{...props}
			/>
		</div>
	);
}
