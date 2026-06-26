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
import { VoucherFilter } from "./VoucherList";

type Props = {
	children?: React.ReactNode;
	filter: VoucherFilter;
	setFilter: (filter: VoucherFilter) => void;
};

export default function VoucherFilterBar({ children, filter, setFilter }: Props) {
	const statusOptions = [
		{ label: "Active", value: "true" },
		{ label: "Inactive", value: "false" },
	];

	const discountTypeOptions = [
		{ label: "Percentage", value: "percentage" },
		{ label: "Fixed Amount", value: "fixed_amount" },
	];

	const filterButtons = (
		<>
			<FilterButton
				title="Status"
				selected={filter.isActive}
				onSelect={(values: string[]) => setFilter({ ...filter, isActive: values })}
				clearFilter={() => setFilter({ ...filter, isActive: [] })}
				options={statusOptions}
			/>
			<FilterButton
				title="Discount Type"
				selected={filter.discountType}
				onSelect={(values: string[]) => setFilter({ ...filter, discountType: values })}
				clearFilter={() => setFilter({ ...filter, discountType: [] })}
				options={discountTypeOptions}
			/>
			<DateRangeFilter
				title="Created Date"
				from={filter.createdFrom}
				to={filter.createdTo}
				onChange={(value) =>
					setFilter({ ...filter, createdFrom: value.from, createdTo: value.to })
				}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{filterButtons}</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children}

				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>

					<FilterContent>{filterButtons}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
