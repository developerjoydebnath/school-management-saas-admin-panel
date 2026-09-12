"use client";

import ProfitLossView from "@/modules/finance/profit-loss/components/ProfitLossView";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Banknote, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function ProfitLossPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("ProfitLoss");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("finance"), href: PATHS.FINANCE.ROOT },
			{ label: tNav("finance_profit_loss"), href: PATHS.FINANCE.PROFIT_LOSS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ProfitLoss">
				{/* The statement is read-only, so the useful actions are the two
				    ledgers it is built from. */}
				<div className="hidden items-center gap-2 @3xl/page:flex">
					<PermissionGuard
						permissions={[
							PERMISSIONS.FINANCE.STUDENT_PAYMENTS.VIEW,
							PERMISSIONS.FINANCE.STUDENT_PAYMENTS.ALL,
							PERMISSIONS.FINANCE.ALL,
						]}
					>
						<Button asChild variant="outline">
							<Link href={PATHS.FINANCE.STUDENT_PAYMENTS.ROOT}>
								<Banknote className="size-4" />
								{t("openFeeCollection")}
							</Link>
						</Button>
					</PermissionGuard>
					<PermissionGuard
						permissions={[
							PERMISSIONS.FINANCE.EXPENSES.VIEW,
							PERMISSIONS.FINANCE.EXPENSES.ALL,
							PERMISSIONS.FINANCE.ALL,
						]}
					>
						<Button asChild variant="outline">
							<Link href={PATHS.FINANCE.EXPENSES.ROOT}>
								<Wallet className="size-4" />
								{t("openExpenses")}
							</Link>
						</Button>
					</PermissionGuard>
				</div>
			</PageHeading>
			<ProfitLossView />
		</div>
	);
}
