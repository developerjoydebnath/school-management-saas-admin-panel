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
import { inventoryTrackingTypeEnum } from "../dto/item.dto";

export type ItemFilter = {
	search: string;
	trackingType: string[];
	isSeatingItem: string[];
	isActive: string[];
	categoryId: string[];
};

type Props = {
	children?: React.ReactNode;
	filter: ItemFilter;
	setFilter: (filter: ItemFilter) => void;
	categoryOptions?: { label: string; value: string }[];
};

const trackingTypeOptions = [
	{ label: "Quantity", value: inventoryTrackingTypeEnum.QUANTITY },
	{ label: "Individual", value: inventoryTrackingTypeEnum.INDIVIDUAL },
];

const yesNoOptions = [
	{ label: "Yes", value: "true" },
	{ label: "No", value: "false" },
];

const statusOptions = [
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" },
];

export default function ItemFilterBar({ children, filter, setFilter, categoryOptions = [] }: Props) {
	const controls = (
		<>
			<FilterButton
				title="Category"
				selected={filter.categoryId}
				onSelect={(values) => setFilter({ ...filter, categoryId: values })}
				clearFilter={() => setFilter({ ...filter, categoryId: [] })}
				options={categoryOptions}
			/>
			<FilterButton
				title="Tracking Type"
				selected={filter.trackingType}
				onSelect={(values) => setFilter({ ...filter, trackingType: values })}
				clearFilter={() => setFilter({ ...filter, trackingType: [] })}
				options={trackingTypeOptions}
			/>
			<FilterButton
				title="Seating Item"
				selected={filter.isSeatingItem}
				onSelect={(values) => setFilter({ ...filter, isSeatingItem: values })}
				clearFilter={() => setFilter({ ...filter, isSeatingItem: [] })}
				options={yesNoOptions}
			/>
			<FilterButton
				title="Status"
				selected={filter.isActive}
				onSelect={(values) => setFilter({ ...filter, isActive: values })}
				clearFilter={() => setFilter({ ...filter, isActive: [] })}
				options={statusOptions}
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
