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
import { DesignationFilter } from "./DesignationList";

type Props = {
	children?: React.ReactNode;
	filter: DesignationFilter;
	setFilter: (filter: DesignationFilter) => void;
};

const statusOptions = [
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" },
];

const categoryOptions = [
	{ label: "Teaching", value: "TEACHING" },
	{ label: "Non-Teaching", value: "NON_TEACHING" },
	{ label: "Administration", value: "ADMINISTRATION" },
	{ label: "Support Staff", value: "SUPPORT_STAFF" },
];

export default function DesignationFilterBar({ children, filter, setFilter }: Props) {
	return (
		<div>
			<FilterDesktopWrapper>
				<FilterButton
					title="Status"
					selected={filter.isActive}
					onSelect={(values: string[]) => setFilter({ ...filter, isActive: values })}
					clearFilter={() => setFilter({ ...filter, isActive: [] })}
					options={statusOptions}
				/>
				<FilterButton
					title="Category"
					selected={filter.category}
					onSelect={(values: string[]) => setFilter({ ...filter, category: values })}
					clearFilter={() => setFilter({ ...filter, category: [] })}
					options={categoryOptions}
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
							selected={filter.isActive}
							onSelect={(values: string[]) => setFilter({ ...filter, isActive: values })}
							clearFilter={() => setFilter({ ...filter, isActive: [] })}
							options={statusOptions}
						/>
						<FilterButton
							title="Category"
							selected={filter.category}
							onSelect={(values: string[]) => setFilter({ ...filter, category: values })}
							clearFilter={() => setFilter({ ...filter, category: [] })}
							options={categoryOptions}
						/>
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
