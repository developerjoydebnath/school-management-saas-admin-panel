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
import type { ParentDirectoryFilter } from "./ParentDirectory";

type Props = {
	children?: React.ReactNode;
	filter: ParentDirectoryFilter;
	setFilter: (filter: ParentDirectoryFilter) => void;
};

const portalStatusOptions = [
	{ label: "Active Portal", value: "active" },
	{ label: "Disabled Portal", value: "inactive" },
];

export default function ParentFilterBar({ children, filter, setFilter }: Props) {
	const renderFilters = () => (
		<FilterButton
			title="Portal Status"
			selected={filter.status || []}
			onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
			clearFilter={() => setFilter({ ...filter, status: undefined })}
			options={portalStatusOptions}
		/>
	);

	return (
		<div>
			<FilterDesktopWrapper>{renderFilters()}</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{renderFilters()}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
