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

export type MovementFilter = {
	search: string;
	movementType: string[];
	dateFrom: string;
	dateTo: string;
};

const movementTypeOptions = [
	{ value: "PURCHASE", label: "Purchase" },
	{ value: "TRANSFER", label: "Transfer" },
	{ value: "ISSUE", label: "Issue" },
	{ value: "RETURN", label: "Return" },
	{ value: "ADJUSTMENT", label: "Adjustment" },
	{ value: "DAMAGE", label: "Damage" },
	{ value: "REPAIR_OUT", label: "Repair Out" },
	{ value: "REPAIR_IN", label: "Repair In" },
	{ value: "DISPOSE", label: "Dispose" },
	{ value: "LOST", label: "Lost" },
];

type Props = {
	children?: React.ReactNode;
	filter: MovementFilter;
	setFilter: (filter: MovementFilter) => void;
};

export default function MovementFilterBar({ children, filter, setFilter }: Props) {
	const controls = (
		<>
			<FilterButton
				title="Movement Type"
				selected={filter.movementType}
				onSelect={(values) => setFilter({ ...filter, movementType: values })}
				clearFilter={() => setFilter({ ...filter, movementType: [] })}
				options={movementTypeOptions}
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
