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
import { PermissionFilter } from "./PermissionList";

type Props = {
	children?: React.ReactNode;
	filter: PermissionFilter;
	setFilter: (filter: PermissionFilter) => void;
};

export default function PermissionFilterBar({ children, filter, setFilter }: Props) {
	const moduleOptions = [
		{ label: "Super Admin", value: "super_admin" },
		{ label: "Administrator", value: "administrator" },
		{ label: "Sub Administrator", value: "sub_administrator" },
		{ label: "Teacher", value: "teacher" },
		{ label: "Student", value: "student" },
		{ label: "Parent", value: "parent" },
		{ label: "Staff", value: "staff" },
		{ label: "Common", value: "common" },
	];

	return (
		<div>
			<FilterDesktopWrapper>
				<FilterButton
					title="Modules Name"
					selected={filter.modules}
					onSelect={(values: string[]) => setFilter({ ...filter, modules: values })}
					clearFilter={() => setFilter({ ...filter, modules: [] })}
					options={moduleOptions}
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
							title="Modules"
							selected={filter.modules}
							onSelect={(values: string[]) =>
								setFilter({ ...filter, modules: values })
							}
							clearFilter={() => setFilter({ ...filter, modules: [] })}
							options={moduleOptions}
						/>
					</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
