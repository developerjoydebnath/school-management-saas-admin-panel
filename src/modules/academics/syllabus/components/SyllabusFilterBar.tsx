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
import { SyllabusFilter } from "./SyllabusList";

type Props = {
	children?: React.ReactNode;
	filter: SyllabusFilter;
	setFilter: (filter: SyllabusFilter) => void;
};

const statusOptions = [
	{ label: "Draft", value: "DRAFT" },
	{ label: "Published", value: "PUBLISHED" },
	{ label: "Archived", value: "ARCHIVED" },
];

export default function SyllabusFilterBar({ children, filter, setFilter }: Props) {
	const filters = (
		<FilterButton
			title="Status"
			selected={filter.status}
			onSelect={(values) => setFilter({ ...filter, status: values })}
			clearFilter={() => setFilter({ ...filter, status: [] })}
			options={statusOptions}
		/>
	);

	return (
		<div>
			<FilterDesktopWrapper>{filters}</FilterDesktopWrapper>
			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{filters}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
