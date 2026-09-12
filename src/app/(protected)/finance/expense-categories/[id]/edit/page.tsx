"use client";

import ExpenseCategoryForm from "@/modules/finance/expense-categories/components/ExpenseCategoryForm";
import { ExpenseCategoryFormValues } from "@/modules/finance/expense-categories/dto/expense-category.dto";
import { useExpenseCategory } from "@/modules/finance/expense-categories/hooks/use-expense-category";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditExpenseCategoryPage() {
	const { id } = useParams<{ id: string }>();
	const { category, isLoading } = useExpenseCategory(id);

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
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="ExpenseCategories" />
				<div className="flex h-64 items-center justify-center">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
				</div>
			</div>
		);
	}

	if (!category) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="ExpenseCategories" />
				<div className="flex h-64 items-center justify-center">
					<p className="text-muted-foreground">Expense category not found</p>
				</div>
			</div>
		);
	}

	const defaultValues: ExpenseCategoryFormValues = {
		name: category.name,
		nameBn: category.nameBn || "",
		code: category.code,
		description: category.description || "",
		recurrence: category.recurrence,
		interval: category.interval || null,
		isActive: category.isActive,
		sortOrder: category.sortOrder,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ExpenseCategories" />
			<ExpenseCategoryForm
				id={id}
				defaultValues={defaultValues}
				isEdit
				isSystem={category.isSystem}
			/>
		</div>
	);
}
