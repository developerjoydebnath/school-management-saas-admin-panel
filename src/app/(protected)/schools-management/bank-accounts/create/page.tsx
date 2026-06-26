"use client";

import { BankAccountForm } from "@/modules/schools-management/bank-accounts/components/BankAccountForm";
import {
	bankAccountPurposeEnum,
	type BankAccountFormValues,
} from "@/modules/schools-management/bank-accounts/dto/bank-account.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CreateBankAccountPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const searchParams = useSearchParams();
	const schoolId = searchParams.get("schoolId") || "";

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{
				label: tNav("schools_management_bank_accounts"),
				href: PATHS.SCHOOLS_MANAGEMENT.BANK_ACCOUNTS.ROOT,
			},
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	const defaultValues: BankAccountFormValues = {
		schoolId,
		accountLabel: "",
		accountPurpose: bankAccountPurposeEnum.FEES,
		isPrimary: false,
		bankName: "",
		bankBranch: "",
		bankRoutingNo: "",
		accountNo: "",
		accountName: "",
		mobileBankingProvider: undefined,
		mobileBankingNo: "",
		isActive: true,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementBankAccountsCreate" />
			<BankAccountForm id={undefined} defaultValues={defaultValues} />
		</div>
	);
}
