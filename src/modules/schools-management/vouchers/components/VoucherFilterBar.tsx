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
import { VoucherFilter } from "./VoucherList";

type Props = {
	children?: React.ReactNode;
	filter: VoucherFilter;
	setFilter: (filter: VoucherFilter) => void;
};

export default function VoucherFilterBar({ children, filter, setFilter }: Props) {
	const statusOptions = [
		{ label: "Active", value: "active" },
		{ label: "Inactive", value: "inactive" },
	];

	const typeOptions = [
		{ label: "Percentage", value: "percentage" },
		{ label: "Fixed Amount", value: "fixed_amount" },
	];

	return (
		<div>
			<FilterDesktopWrapper>
				<FilterButton
					title="Status"
					selected={filter.status ? [filter.status] : []}
					onSelect={(values: string[]) => setFilter({ ...filter, status: values[0] || "" })}
					clearFilter={() => setFilter({ ...filter, status: "" })}
					options={statusOptions}
				/>
				<FilterButton
					title="Type"
					selected={filter.discountType ? [filter.discountType] : []}
					onSelect={(values: string[]) => setFilter({ ...filter, discountType: values[0] || "" })}
					clearFilter={() => setFilter({ ...filter, discountType: "" })}
					options={typeOptions}
				/>
			</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children && children}

				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>

					<FilterContent>
						<FilterButton
							title="Status"
							selected={filter.status ? [filter.status] : []}
							onSelect={(values: string[]) =>
								setFilter({ ...filter, status: values[0] || "" })
							}
							clearFilter={() => setFilter({ ...filter, status: "" })}
							options={statusOptions}
						/>
						<FilterButton
							title="Type"
							selected={filter.discountType ? [filter.discountType] : []}
							onSelect={(values: string[]) =>
								setFilter({ ...filter, discountType: values[0] || "" })
							}
							clearFilter={() => setFilter({ ...filter, discountType: "" })}
							options={typeOptions}
						/>
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
