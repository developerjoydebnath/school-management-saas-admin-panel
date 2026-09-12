"use client";

import ExpenseCategoryForm from "@/modules/finance/expense-categories/components/ExpenseCategoryForm";
import { ExpenseCategoryFormValues } from "@/modules/finance/expense-categories/dto/expense-category.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const defaultValues: ExpenseCategoryFormValues = {
	name: "",
	nameBn: "",
	code: "",
	description: "",
	recurrence: "ONE_OFF",
	interval: null,
	isActive: true,
	sortOrder: 500,
};

export default function CreateExpenseCategoryPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("finance"), href: PATHS.FINANCE.ROOT },
			{
				label: tNav("finance_expense_categories"),
				href: PATHS.FINANCE.EXPENSE_CATEGORIES.ROOT,
			},
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ExpenseCategories" />
			<ExpenseCategoryForm defaultValues={defaultValues} />
		</div>
	);
}
