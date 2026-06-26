"use client";

import { usePayment } from "@/modules/schools-management/hooks/use-payments";
import { PaymentDetails } from "@/modules/schools-management/payments/components/PaymentDetails";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function PaymentDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data: payment, isLoading } = usePayment(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{
				label: tNav("schools_management_payments"),
				href: PATHS.SCHOOLS_MANAGEMENT.PAYMENTS.ROOT,
			},
			{ label: tNav("details") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementPaymentsDetails" />
			{payment ? (
				<PaymentDetails payment={payment} />
			) : (
				<div className="rounded-lg border bg-card p-6 text-center">
					<h2 className="text-lg font-semibold">No payment found</h2>
					<p className="text-sm text-muted-foreground">
						The payment you are trying to view does not exist.
					</p>
				</div>
			)}
		</div>
	);
}
