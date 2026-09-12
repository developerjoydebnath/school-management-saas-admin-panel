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
import { useTranslations } from "next-intl";
import React from "react";
import {
	EXPENSE_RECURRENCE_OPTIONS,
	EXPENSE_SOURCE_OPTIONS,
} from "../dto/expense-category.dto";
import { ExpenseCategoryFilter } from "./ExpenseCategoryList";

type Props = {
	children?: React.ReactNode;
	filter: ExpenseCategoryFilter;
	setFilter: (filter: ExpenseCategoryFilter) => void;
};

const statusOptions = [
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" },
];

export default function ExpenseCategoryFilterBar({ children, filter, setFilter }: Props) {
	const t = useTranslations("ExpenseCategories");

	const controls = (
		<>
			<FilterButton
				title={t("status")}
				selected={filter.isActive}
				onSelect={(values: string[]) => setFilter({ ...filter, isActive: values })}
				clearFilter={() => setFilter({ ...filter, isActive: [] })}
				options={statusOptions}
			/>
			<FilterButton
				title={t("recurrence")}
				selected={filter.recurrence}
				onSelect={(values: string[]) => setFilter({ ...filter, recurrence: values })}
				clearFilter={() => setFilter({ ...filter, recurrence: [] })}
				options={EXPENSE_RECURRENCE_OPTIONS}
			/>
			<FilterButton
				title={t("source")}
				selected={filter.source}
				onSelect={(values: string[]) => setFilter({ ...filter, source: values })}
				clearFilter={() => setFilter({ ...filter, source: [] })}
				options={EXPENSE_SOURCE_OPTIONS}
			/>
		</>
	);

	return (
		<div>
			<FilterDesktopWrapper>{controls}</FilterDesktopWrapper>

			<FilterMobileWrapper>
				{children}
				<FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>{t("filter")}</span>
						</span>
					</FilterTriggerButton>
					<FilterContent>{controls}</FilterContent>
				</FilterContainer>
			</FilterMobileWrapper>
		</div>
	);
}
