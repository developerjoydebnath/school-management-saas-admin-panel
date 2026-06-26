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
import { SubjectFilter } from "./SubjectList";

type Props = {
	children?: React.ReactNode;
	filter: SubjectFilter;
	setFilter: (filter: SubjectFilter) => void;
};

const statusOptions = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
];

const typeOptions = [
	{ label: "Mandatory", value: "MANDATORY" },
	{ label: "Optional", value: "OPTIONAL" },
	{ label: "Practical", value: "PRACTICAL" },
	{ label: "Fourth Subject", value: "FOURTH_SUBJECT" },
	{ label: "Religion", value: "RELIGION" },
	{ label: "Group Based", value: "GROUP_BASED" },
];

const groupOptions = [
	{ label: "General", value: "general" },
	{ label: "Science", value: "science" },
	{ label: "Humanities", value: "humanities" },
	{ label: "Business Studies", value: "business_studies" },
];

function SubjectFilters({ filter, setFilter }: Omit<Props, "children">) {
	return (
		<>
			<FilterButton
				title="Type"
				selected={filter.type}
				onSelect={(values: string[]) => setFilter({ ...filter, type: values })}
				clearFilter={() => setFilter({ ...filter, type: [] })}
				options={typeOptions}
			/>
			<FilterButton
				title="Group"
				selected={filter.group}
				onSelect={(values: string[]) => setFilter({ ...filter, group: values })}
				clearFilter={() => setFilter({ ...filter, group: [] })}
				options={groupOptions}
			/>
			<FilterButton
				title="Status"
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={statusOptions}
			/>
		</>
	);
}

export default function SubjectFilterBar({ children, filter, setFilter }: Props) {
	return (
		<div>
			<FilterDesktopWrapper>
				<SubjectFilters filter={filter} setFilter={setFilter} />
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
						<SubjectFilters filter={filter} setFilter={setFilter} />
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
