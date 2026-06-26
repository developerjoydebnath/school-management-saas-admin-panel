"use client";

import { PaymentForm } from "@/modules/schools-management/payments/components/PaymentForm";
import {
	PaymentFormValues,
	paymentMethodEnum,
	paymentStatusEnum,
} from "@/modules/schools-management/payments/dto/payment.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function CreatePaymentPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const searchParams = useSearchParams();
	const schoolId = searchParams.get("schoolId") || "";

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{
				label: tNav("schools_management_payments"),
				href: PATHS.SCHOOLS_MANAGEMENT.PAYMENTS.ROOT,
			},
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	const defaultValues: PaymentFormValues = {
		schoolId,
		subscriptionId: "",
		voucherCode: "",
		billingCycles: 1,
		transactionId: "",
		invoiceId: "",
		amount: 0,
		currency: "BDT",
		status: paymentStatusEnum.COMPLETED,
		method: paymentMethodEnum.CASH,
		paidAt: new Date().toISOString().slice(0, 10),
		notes: "",
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementPaymentsCreate" />
			<PaymentForm id={undefined} defaultValues={defaultValues} />
		</div>
	);
}
