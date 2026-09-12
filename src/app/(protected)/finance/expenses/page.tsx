"use client";

import { ExpenseCreate } from "@/modules/finance/expenses/components/ExpenseCreate";
import ExpenseList from "@/modules/finance/expenses/components/ExpenseList";
import ExpenseSummary from "@/modules/finance/expenses/components/ExpenseSummary";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Tags } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function ExpensesPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("Expenses");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("finance"), href: PATHS.FINANCE.ROOT },
			{ label: tNav("finance_expenses"), href: PATHS.FINANCE.EXPENSES.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Expenses">
				<div className="hidden items-center gap-2 @3xl/page:flex">
					<PermissionGuard
						permissions={[
							PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.VIEW,
							PERMISSIONS.FINANCE.EXPENSE_CATEGORIES.ALL,
							PERMISSIONS.FINANCE.ALL,
						]}
					>
						<Button asChild variant="outline">
							<Link href={PATHS.FINANCE.EXPENSE_CATEGORIES.ROOT}>
								<Tags className="size-4" />
								{t("manageCategories")}
							</Link>
						</Button>
					</PermissionGuard>
					<ExpenseCreate />
				</div>
			</PageHeading>
			<ExpenseSummary />
			<ExpenseList />
		</div>
	);
}
