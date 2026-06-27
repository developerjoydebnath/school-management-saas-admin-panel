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
import { DepartmentFilter } from "./DepartmentList";

type Props = {
	children?: React.ReactNode;
	filter: DepartmentFilter;
	setFilter: (filter: DepartmentFilter) => void;
};

const statusOptions = [
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" },
];

export default function DepartmentFilterBar({ children, filter, setFilter }: Props) {
	return (
		<div>
			<FilterDesktopWrapper>
				<FilterButton
					title="Status"
					selected={filter.isActive !== undefined ? [String(filter.isActive)] : []}
					onSelect={(values: string[]) => setFilter({ ...filter, isActive: values[0] === "true" })}
					clearFilter={() => setFilter({ ...filter, isActive: undefined })}
					options={statusOptions}
					singleSelect
				/>
			</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children}
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
							selected={filter.isActive !== undefined ? [String(filter.isActive)] : []}
							onSelect={(values: string[]) =>
								setFilter({ ...filter, isActive: values[0] === "true" })
							}
							clearFilter={() => setFilter({ ...filter, isActive: undefined })}
							options={statusOptions}
							singleSelect
						/>
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
