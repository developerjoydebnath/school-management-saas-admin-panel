"use client";

import { VoucherCreateButton } from "@/modules/schools-management/vouchers/components/VoucherCreateButton";
import { VoucherList } from "@/modules/schools-management/vouchers/components/VoucherList";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function VouchersPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const locale = useLocale();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: tNav("schools_management_vouchers") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="VouchersPage">
				<PermissionGuard
					permissions={[
						PERMISSIONS.SCHOOLS_MANAGEMENT.ALL,
						PERMISSIONS.SCHOOLS_MANAGEMENT.VOUCHERS.ALL,
						PERMISSIONS.SCHOOLS_MANAGEMENT.VOUCHERS.CREATE,
					]}
				>
					<div className="hidden @3xl/page:flex">
						<VoucherCreateButton />
					</div>
				</PermissionGuard>
			</PageHeading>

			<VoucherList />
		</div>
	);
}
