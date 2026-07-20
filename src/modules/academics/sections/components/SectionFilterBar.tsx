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
import { SectionFilter } from "./SectionList";

type Props = {
	children?: React.ReactNode;
	filter: SectionFilter;
	setFilter: (filter: SectionFilter) => void;
};

const statusOptions = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" },
];

export default function SectionFilterBar({ children, filter, setFilter }: Props) {
	return (
		<div>
			<FilterDesktopWrapper>
				<FilterButton
					title="Status"
					selected={filter.status}
					onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
					clearFilter={() => setFilter({ ...filter, status: [] })}
					options={statusOptions}
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
							selected={filter.status}
							onSelect={(values: string[]) =>
								setFilter({ ...filter, status: values })
							}
							clearFilter={() => setFilter({ ...filter, status: [] })}
							options={statusOptions}
						/>
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
