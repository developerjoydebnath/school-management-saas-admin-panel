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
import { SchoolSubscriptionFilter } from "./SchoolSubscriptionList";

type Props = {
	children?: React.ReactNode;
	filter: SchoolSubscriptionFilter;
	setFilter: (filter: SchoolSubscriptionFilter) => void;
};

export default function SchoolSubscriptionFilterBar({ children, filter, setFilter }: Props) {
	const statusOptions = [
		{ label: "Active", value: "active" },
		{ label: "Expired", value: "expired" },
		{ label: "Cancelled", value: "cancelled" },
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
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
