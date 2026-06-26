"use client";

import { PaymentCreateButton } from "@/modules/schools-management/payments/components/PaymentCreateButton";
import { PaymentList } from "@/modules/schools-management/payments/components/PaymentList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function PaymentsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: tNav("schools_management_payments") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementPayments">
				<div className="hidden @3xl/page:flex">
					<PaymentCreateButton />
				</div>
			</PageHeading>
			<PaymentList />
		</div>
	);
}
