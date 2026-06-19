"use client";

import { VoucherEditForm } from "@/modules/schools-management/vouchers/components/VoucherEditForm";
import { VoucherFormSkeleton } from "@/modules/schools-management/vouchers/components/VoucherFormSkeleton";
import { useVoucher } from "@/modules/schools-management/vouchers/hooks/use-voucher";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function VoucherEditPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const locale = useLocale();
	
	const { data: voucher, isLoading, error } = useVoucher(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: tNav("schools_management_vouchers"), href: PATHS.SCHOOLS_MANAGEMENT.VOUCHERS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="VoucherEditPage" />
			{isLoading ? (
				<VoucherFormSkeleton />
			) : error || !voucher ? (
				<div className="flex h-40 items-center justify-center text-muted-foreground">
					Voucher not found or error loading data.
				</div>
			) : (
				<VoucherEditForm voucher={voucher} />
			)}
		</div>
	);
}
