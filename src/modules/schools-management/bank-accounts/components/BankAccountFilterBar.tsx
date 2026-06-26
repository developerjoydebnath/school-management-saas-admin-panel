"use client";

import {
	FilterContainer,
	FilterContent,
	FilterDesktopWrapper,
	FilterMobileWrapper,
	FilterTriggerButton,
} from "@/shared/components/custom/Filter";
import DateRangeFilter from "@/shared/components/form/DateRangeFilter";
import FilterButton from "@/shared/components/form/FilterButton";
import { IconFilter } from "@tabler/icons-react";
import { ReactNode } from "react";
import { BankAccountFilter } from "./BankAccountList";

type Props = {
	children?: ReactNode;
	filter: BankAccountFilter;
	setFilter: (filter: BankAccountFilter) => void;
};

const statusOptions = [
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" },
];

const purposeOptions = [
	{ label: "Salary", value: "salary" },
	{ label: "Fees", value: "fees" },
	{ label: "Development", value: "development" },
	{ label: "Grant", value: "grant" },
	{ label: "General", value: "general" },
];

export default function BankAccountFilterBar({ children, filter, setFilter }: Props) {
	const content = (
		<>
			<FilterButton
				title="Status"
				selected={filter.isActive}
				onSelect={(values: string[]) => setFilter({ ...filter, isActive: values })}
				clearFilter={() => setFilter({ ...filter, isActive: [] })}
				options={statusOptions}
			/>
			<FilterButton
				title="Account Purpose"
				selected={filter.accountPurpose}
				onSelect={(values: string[]) => setFilter({ ...filter, accountPurpose: values })}
				clearFilter={() => setFilter({ ...filter, accountPurpose: [] })}
				options={purposeOptions}
			/>
			<DateRangeFilter
				title="Created Date"
				from={filter.createdFrom}
				to={filter.createdTo}
				onChange={(value) =>
					setFilter({ ...filter, createdFrom: value.from, createdTo: value.to })
				}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{content}</FilterDesktopWrapper>
			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{content}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
