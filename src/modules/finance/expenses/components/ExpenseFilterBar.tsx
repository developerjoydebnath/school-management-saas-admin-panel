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
import MonthFilter from "@/shared/components/form/MonthFilter";
import { IconFilter } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { useExpenseCategories } from "../../expense-categories/hooks/use-expense-categories";
import { ExpenseCategoryModel } from "../../expense-categories/models/expense-category.model";
import {
	EXPENSE_PAYMENT_METHOD_OPTIONS,
	EXPENSE_SOURCE_FILTER_OPTIONS,
	EXPENSE_STATUS_OPTIONS,
} from "../dto/expense.dto";
import { ExpenseFilter } from "./ExpenseList";

type Props = {
	children?: React.ReactNode;
	filter: ExpenseFilter;
	setFilter: (filter: ExpenseFilter) => void;
};

export default function ExpenseFilterBar({ children, filter, setFilter }: Props) {
	const t = useTranslations("Expenses");

	// Every category, not just the manually-pickable ones: an automatic
	// Inventory row still has to be filterable by its category.
	const { categories } = useExpenseCategories({ page: 1, limit: 100 });

	const categoryOptions = useMemo(
		() =>
			((categories || []) as ExpenseCategoryModel[]).map((category) => ({
				label: category.name,
				value: category.id,
			})),
		[categories]
	);

	const controls = (
		<>
			<FilterButton
				title={t("category")}
				selected={filter.categoryId}
				onSelect={(values: string[]) => setFilter({ ...filter, categoryId: values })}
				clearFilter={() => setFilter({ ...filter, categoryId: [] })}
				options={categoryOptions}
			/>
			<FilterButton
				title={t("status")}
				selected={filter.status}
				onSelect={(values: string[]) => setFilter({ ...filter, status: values })}
				clearFilter={() => setFilter({ ...filter, status: [] })}
				options={EXPENSE_STATUS_OPTIONS}
			/>
			<FilterButton
				title={t("paymentMethod")}
				selected={filter.paymentMethod}
				onSelect={(values: string[]) => setFilter({ ...filter, paymentMethod: values })}
				clearFilter={() => setFilter({ ...filter, paymentMethod: [] })}
				options={EXPENSE_PAYMENT_METHOD_OPTIONS}
			/>
			<FilterButton
				title={t("source")}
				selected={filter.source}
				onSelect={(values: string[]) => setFilter({ ...filter, source: values })}
				clearFilter={() => setFilter({ ...filter, source: [] })}
				options={EXPENSE_SOURCE_FILTER_OPTIONS}
			/>
			{/* The API reads `dateFrom`/`dateTo` only when BOTH are set and falls
			    back to `month` otherwise, so picking a range clears the month and
			    picking a month clears the range — the two can never disagree. */}
			<MonthFilter
				title={t("month")}
				value={filter.month}
				onChange={(month) => setFilter({ ...filter, month, dateFrom: "", dateTo: "" })}
			/>
			<DateRangeFilter
				title={t("expenseDate")}
				from={filter.dateFrom}
				to={filter.dateTo}
				onChange={(value) =>
					setFilter({ ...filter, dateFrom: value.from, dateTo: value.to, month: "" })
				}
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
