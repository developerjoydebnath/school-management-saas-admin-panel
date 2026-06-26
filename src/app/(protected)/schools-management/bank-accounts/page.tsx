"use client";

import { BankAccountList } from "@/modules/schools-management/bank-accounts/components/BankAccountList";
import { BankAccountCreateButton } from "@/modules/schools-management/bank-accounts/components/BankAccountCreateButton";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function BankAccountsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: tNav("schools_management_bank_accounts") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementBankAccounts">
				<div className="hidden @3xl/page:flex">
					<BankAccountCreateButton />
				</div>
			</PageHeading>
			<BankAccountList />
		</div>
	);
}
