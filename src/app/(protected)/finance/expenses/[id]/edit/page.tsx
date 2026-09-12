"use client";

import ExpenseForm from "@/modules/finance/expenses/components/ExpenseForm";
import { ExpenseFormValues } from "@/modules/finance/expenses/dto/expense.dto";
import { useExpense } from "@/modules/finance/expenses/hooks/use-expense";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditExpensePage() {
	const { id } = useParams<{ id: string }>();
	const { expense, isLoading } = useExpense(id);

	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("Expenses");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("finance"), href: PATHS.FINANCE.ROOT },
			{ label: tNav("finance_expenses"), href: PATHS.FINANCE.EXPENSES.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="Expenses" />
				<div className="flex h-64 items-center justify-center">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
				</div>
			</div>
		);
	}

	if (!expense) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="Expenses" />
				<div className="flex h-64 items-center justify-center">
					<p className="text-muted-foreground">Expense not found</p>
				</div>
			</div>
		);
	}

	// An Inventory-owned row would be rejected by the API anyway — say where it
	// is edited instead of rendering a form that cannot save.
	if (expense.isLocked) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="Expenses" />
				<div className="border-border/70 bg-muted/40 mx-auto max-w-2xl space-y-3 rounded-md border border-dashed p-6 text-center">
					<p className="font-medium">{expense.title}</p>
					<p className="text-muted-foreground text-sm">{t("lockedEditNotice")}</p>
					<Button asChild variant="outline">
						<Link href={PATHS.FINANCE.EXPENSES.ROOT}>{t("backToExpenses")}</Link>
					</Button>
				</div>
			</div>
		);
	}

	const defaultValues: ExpenseFormValues = {
		categoryId: expense.categoryId,
		title: expense.title,
		description: expense.description || "",
		amount: expense.amount,
		expenseDate: expense.expenseDate,
		status: expense.status,
		paymentMethod: (expense.paymentMethod || "") as ExpenseFormValues["paymentMethod"],
		referenceNo: expense.referenceNo || "",
		payee: expense.payee || "",
		billingPeriod: expense.billingPeriod || "",
		notes: expense.notes || "",
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Expenses" />
			<ExpenseForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
