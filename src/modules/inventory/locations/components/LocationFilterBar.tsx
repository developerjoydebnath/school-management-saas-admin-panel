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
import { LOCATION_TYPES } from "../dto/location.dto";

export type LocationFilter = {
	search: string;
	status: string[];
	locationType: string[];
	dateFrom: string;
	dateTo: string;
};

type Props = {
	children?: React.ReactNode;
	filter: LocationFilter;
	setFilter: (filter: LocationFilter) => void;
};

const statusOptions = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
];

const locationTypeOptions = LOCATION_TYPES.map((type) => ({
	label: type,
	value: type,
}));

export default function LocationFilterBar({ children, filter, setFilter }: Props) {
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
				title="Location Type"
				selected={filter.locationType}
				onSelect={(values) => setFilter({ ...filter, locationType: values })}
				clearFilter={() => setFilter({ ...filter, locationType: [] })}
				options={locationTypeOptions}
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
