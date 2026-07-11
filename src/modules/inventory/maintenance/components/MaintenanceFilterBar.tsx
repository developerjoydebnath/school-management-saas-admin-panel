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

export type MaintenanceFilter = {
	search: string;
	status: string[];
	priority: string[];
	dateFrom: string;
	dateTo: string;
};

const statusOptions = [
	{ value: "OPEN", label: "Open" },
	{ value: "IN_PROGRESS", label: "In Progress" },
	{ value: "RESOLVED", label: "Resolved" },
	{ value: "CANCELLED", label: "Cancelled" },
];

const priorityOptions = [
	{ value: "LOW", label: "Low" },
	{ value: "MEDIUM", label: "Medium" },
	{ value: "HIGH", label: "High" },
	{ value: "URGENT", label: "Urgent" },
];

type Props = {
	children?: React.ReactNode;
	filter: MaintenanceFilter;
	setFilter: (filter: MaintenanceFilter) => void;
};

export default function MaintenanceFilterBar({ children, filter, setFilter }: Props) {
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
				title="Priority"
				selected={filter.priority}
				onSelect={(values) => setFilter({ ...filter, priority: values })}
				clearFilter={() => setFilter({ ...filter, priority: [] })}
				options={priorityOptions}
			/>
			<DateRangeFilter
				title="Reported Date"
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
