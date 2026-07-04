"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";
import { IconFilter } from "@tabler/icons-react";
import React from "react";

type Filter = {
	search: string;
	status: string[];
	type: string[];
};

type Props = {
	children?: React.ReactNode;
	filter: Filter;
	setFilter: (filter: Filter) => void;
	typeTitle?: string;
	typeOptions?: { label: string; value: string }[];
};

const statusOptions = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
	{ label: "Open", value: "OPEN" },
	{ label: "In Progress", value: "IN_PROGRESS" },
	{ label: "Resolved", value: "RESOLVED" },
	{ label: "In Store", value: "IN_STORE" },
	{ label: "In Use", value: "IN_USE" },
];

export default function InventoryFilterBar({
	children,
	filter,
	setFilter,
	typeTitle = "Type",
	typeOptions = [],
}: Props) {
	const controls = (
		<>
			<FilterButton
				title="Status"
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={statusOptions}
			/>
			{typeOptions.length > 0 && (
				<FilterButton
					title={typeTitle}
					selected={filter.type}
					onSelect={(values: string[]) => setFilter({ ...filter, type: values })}
					clearFilter={() => setFilter({ ...filter, type: [] })}
					options={typeOptions}
				/>
			)}
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{controls}</FilterDesktopWrapper>
			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{controls}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
