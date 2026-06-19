"use client";

import { VoucherCreateForm } from "@/modules/schools-management/vouchers/components/VoucherCreateForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function VoucherCreatePage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const locale = useLocale();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{
				label: tNav("schools_management_vouchers"),
				href: PATHS.SCHOOLS_MANAGEMENT.VOUCHERS.ROOT,
			},
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="VoucherCreatePage" />
			<VoucherCreateForm />
		</div>
	);
}
