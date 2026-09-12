"use client";

import ExpenseForm from "@/modules/finance/expenses/components/ExpenseForm";
import { ExpenseFormValues } from "@/modules/finance/expenses/dto/expense.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";

export default function CreateExpensePage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("finance"), href: PATHS.FINANCE.ROOT },
			{ label: tNav("finance_expenses"), href: PATHS.FINANCE.EXPENSES.ROOT },
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	// Most entries are typed the day the money leaves the drawer, so today is
	// the useful default. Computed once so the field never jumps on a re-render.
	const defaultValues: ExpenseFormValues = useMemo(
		() => ({
			categoryId: "",
			title: "",
			description: "",
			amount: 0,
			expenseDate: new Date().toISOString().slice(0, 10),
			status: "PAID",
			paymentMethod: "cash",
			referenceNo: "",
			payee: "",
			billingPeriod: "",
			notes: "",
		}),
		[]
	);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Expenses" />
			<ExpenseForm defaultValues={defaultValues} />
		</div>
	);
}
