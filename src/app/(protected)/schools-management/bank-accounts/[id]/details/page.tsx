"use client";

import { BankAccountDetails } from "@/modules/schools-management/bank-accounts/components/BankAccountDetails";
import { useBankAccount } from "@/modules/schools-management/hooks/use-bank-accounts";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function BankAccountDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data: account, isLoading } = useBankAccount(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{
				label: tNav("schools_management_bank_accounts"),
				href: PATHS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.ROOT,
			},
			{ label: tNav("details") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementBankAccountsDetails" />
			{isLoading || !account ? (
				<div className="space-y-4">
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
				</div>
			) : (
				<BankAccountDetails account={account} />
			)}
		</div>
	);
}
