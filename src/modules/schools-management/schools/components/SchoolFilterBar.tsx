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
import { SchoolFilter } from "./SchoolList";

type Props = {
	children?: React.ReactNode;
	filter: SchoolFilter;
	setFilter: (filter: SchoolFilter) => void;
};

export default function SchoolFilterBar({ children, filter, setFilter }: Props) {
	const statusOptions = [
		{ label: "Pending", value: "pending" },
		{ label: "Active", value: "active" },
		{ label: "Suspended", value: "suspended" },
		{ label: "Rejected", value: "rejected" },
	];

	const typeOptions = [
		{ label: "School", value: "school" },
		{ label: "College", value: "college" },
		{ label: "University", value: "university" },
		{ label: "Kindergarten", value: "kindergarten" },
		{ label: "Coaching Center", value: "coaching_center" },
		{ label: "Madrasah", value: "madrasah" },
		{ label: "Other", value: "other" },
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
					selected={filter.schoolType ? [filter.schoolType] : []}
					onSelect={(values: string[]) => setFilter({ ...filter, schoolType: values[0] || "" })}
					clearFilter={() => setFilter({ ...filter, schoolType: "" })}
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
							selected={filter.schoolType ? [filter.schoolType] : []}
							onSelect={(values: string[]) =>
								setFilter({ ...filter, schoolType: values[0] || "" })
							}
							clearFilter={() => setFilter({ ...filter, schoolType: "" })}
							options={typeOptions}
						/>
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
