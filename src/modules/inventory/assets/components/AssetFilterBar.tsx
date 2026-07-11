"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import DateRangeFilter from "@/shared/components/form/DateRangeFilter";
import FilterButton from "@/shared/components/form/FilterButton";
import { IconFilter } from "@tabler/icons-react";
import React from "react";

export type AssetFilter = {
	search: string;
	status: string[];
	condition: string[];
	dateFrom: string;
	dateTo: string;
};

type Props = {
	children?: React.ReactNode;
	filter: AssetFilter;
	setFilter: (filter: AssetFilter) => void;
};

const statusOptions = [
	{ label: "In Use", value: "IN_USE" },
	{ label: "In Store", value: "IN_STORE" },
	{ label: "Under Repair", value: "UNDER_REPAIR" },
	{ label: "Disposed", value: "DISPOSED" },
	{ label: "Lost", value: "LOST" },
	{ label: "Stolen", value: "STOLEN" },
];

const conditionOptions = [
	{ label: "Good", value: "GOOD" },
	{ label: "Fair", value: "FAIR" },
	{ label: "Poor", value: "POOR" },
	{ label: "Damaged", value: "DAMAGED" },
	{ label: "Under Repair", value: "UNDER_REPAIR" },
	{ label: "Disposed", value: "DISPOSED" },
];

export default function AssetFilterBar({ children, filter, setFilter }: Props) {
	const controls = (
		<>
			<FilterButton
				title="Status"
				selected={filter.status}
				onSelect={(values) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={statusOptions}
			/>
			<FilterButton
				title="Condition"
				selected={filter.condition}
				onSelect={(values) => setFilter({ ...filter, condition: values })}
				clearFilter={() => setFilter({ ...filter, condition: [] })}
				options={conditionOptions}
			/>
			<DateRangeFilter
				title="Created Date"
				from={filter.dateFrom}
				to={filter.dateTo}
				onChange={(value) =>
					setFilter({ ...filter, dateFrom: value.from, dateTo: value.to })
				}
			/>
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
