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
	action: string[];
	entityType: string[];
};

type Props = {
	children?: React.ReactNode;
	filter: Filter;
	setFilter: (filter: Filter) => void;
};

const actionOptions = [
	{ label: "Create", value: "CREATE" },
	{ label: "Update", value: "UPDATE" },
	{ label: "Delete", value: "DELETE" },
	{ label: "Purchase", value: "PURCHASE" },
	{ label: "Transfer", value: "TRANSFER" },
	{ label: "Issue", value: "ISSUE" },
	{ label: "Return", value: "RETURN" },
	{ label: "Adjustment", value: "ADJUSTMENT" },
	{ label: "Disposal", value: "DISPOSAL" },
];

const entityTypeOptions = [
	{ label: "Category", value: "CATEGORY" },
	{ label: "Item", value: "ITEM" },
	{ label: "Location", value: "LOCATION" },
	{ label: "Stock Batch", value: "STOCK_BATCH" },
	{ label: "Asset", value: "ASSET" },
	{ label: "Movement", value: "MOVEMENT" },
	{ label: "Maintenance", value: "MAINTENANCE" },
];

export default function AuditLogFilterBar({
	children,
	filter,
	setFilter,
}: Props) {
	const controls = (
		<>
			<FilterButton
				title="Action"
				selected={filter.action}
				onSelect={(values: string[]) => setFilter({ ...filter, action: values })}
				clearFilter={() => setFilter({ ...filter, action: [] })}
				options={actionOptions}
			/>
			<FilterButton
				title="Entity Type"
				selected={filter.entityType}
				onSelect={(values: string[]) => setFilter({ ...filter, entityType: values })}
				clearFilter={() => setFilter({ ...filter, entityType: [] })}
				options={entityTypeOptions}
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
