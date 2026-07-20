"use client";

import { StudentPaymentList } from "@/modules/finance/student-payments/components/StudentPaymentList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function StudentPaymentsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("finance"), href: PATHS.FINANCE.ROOT },
			{ label: tNav("finance_student_payments") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StudentPayments" />
			<StudentPaymentList />
		</div>
	);
}
