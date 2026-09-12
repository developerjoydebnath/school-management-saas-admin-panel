"use client";

import { ExpenseCategoryCreate } from "@/modules/finance/expense-categories/components/ExpenseCategoryCreate";
import ExpenseCategoryList from "@/modules/finance/expense-categories/components/ExpenseCategoryList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ExpenseCategoriesPage() {
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
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ExpenseCategories">
				<div className="hidden @3xl/page:flex">
					<ExpenseCategoryCreate />
				</div>
			</PageHeading>
			<ExpenseCategoryList />
		</div>
	);
}
