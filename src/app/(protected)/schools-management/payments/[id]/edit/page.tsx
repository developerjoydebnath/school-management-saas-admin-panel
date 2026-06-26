"use client";

import { usePayment } from "@/modules/schools-management/hooks/use-payments";
import { PaymentForm } from "@/modules/schools-management/payments/components/PaymentForm";
import {
	PaymentFormValues,
	paymentMethodEnum,
	paymentStatusEnum,
} from "@/modules/schools-management/payments/dto/payment.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

const toDateInput = (value?: string | null) => {
	if (!value) return "";
	return new Date(value).toISOString().slice(0, 10);
};

export default function EditPaymentPage({
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
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="mx-auto max-w-5xl space-y-4">
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	const defaultValues: PaymentFormValues = {
		schoolId: payment?.schoolId || "",
		subscriptionId: payment?.subscriptionId || "",
		voucherCode: "",
		billingCycles: Number(payment?.original?.metadata?.billingCycles ?? 1),
		transactionId: payment?.transactionId || "",
		invoiceId: payment?.invoiceId || "",
		amount: payment?.amount ?? 0,
		currency: payment?.currency || "BDT",
		status: (payment?.status || paymentStatusEnum.PENDING) as paymentStatusEnum,
		method: (payment?.method || paymentMethodEnum.CASH) as paymentMethodEnum,
		paidAt: toDateInput(payment?.paidAt),
		notes: payment?.notes || "",
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementPaymentsEdit" />
			{!payment ? (
				<div className="mx-auto max-w-5xl rounded-lg border bg-card p-6 text-center">
					<h2 className="text-lg font-semibold">No payment found</h2>
					<p className="text-sm text-muted-foreground">
						The payment you are trying to edit does not exist.
					</p>
				</div>
			) : (
				<PaymentForm id={payment.id} defaultValues={defaultValues} isEdit />
			)}
		</div>
	);
}
