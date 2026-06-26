"use client";

import { useBankAccount } from "@/modules/schools-management/hooks/use-bank-accounts";
import { BankAccountForm } from "@/modules/schools-management/bank-accounts/components/BankAccountForm";
import {
	bankAccountPurposeEnum,
	type BankAccountFormValues,
} from "@/modules/schools-management/bank-accounts/dto/bank-account.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditBankAccountPage({
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
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="mx-auto max-w-5xl space-y-4">
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	const defaultValues: BankAccountFormValues = {
		schoolId: account?.schoolId || "",
		accountLabel: account?.accountLabel || "",
		accountPurpose: (account?.accountPurpose || bankAccountPurposeEnum.FEES) as bankAccountPurposeEnum,
		isPrimary: account?.isPrimary ?? false,
		bankName: account?.bankName || "",
		bankBranch: account?.bankBranch || "",
		bankRoutingNo: account?.bankRoutingNo || "",
		accountNo: account?.accountNo || "",
		accountName: account?.accountName || "",
		mobileBankingProvider: (account?.mobileBankingProvider || undefined) as any,
		mobileBankingNo: account?.mobileBankingNo || "",
		isActive: account?.isActive ?? true,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementBankAccountsEdit" />
			{!account ? (
				<div className="mx-auto max-w-5xl space-y-4">
					<div className="bg-card rounded-lg border p-6 text-center">
						<h2 className="text-lg font-semibold">No bank account found</h2>
						<p className="text-muted-foreground text-sm">
							The bank account you are trying to edit does not exist or has been deleted.
						</p>
					</div>
				</div>
			) : (
				<BankAccountForm id={account.id} defaultValues={defaultValues} isEdit={true} />
			)}
		</div>
	);
}
