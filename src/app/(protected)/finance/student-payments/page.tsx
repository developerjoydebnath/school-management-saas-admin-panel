"use client";

import PaymentFormDialog from "@/modules/finance/student-payments/components/PaymentFormDialog";
import { StudentPaymentList } from "@/modules/finance/student-payments/components/StudentPaymentList";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function StudentPaymentsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("StudentPayments");
	const [isAddOpen, setIsAddOpen] = useState(false);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("finance"), href: PATHS.FINANCE.ROOT },
			{ label: tNav("finance_student_payments") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="StudentPayments">
				<PermissionGuard
					permissions={[
						PERMISSIONS.FINANCE.STUDENT_PAYMENTS.CREATE,
						PERMISSIONS.FINANCE.STUDENT_PAYMENTS.ALL,
					]}
				>
					<Button onClick={() => setIsAddOpen(true)}>
						<Plus className="size-4" />
						<span>{t("addPayment")}</span>
					</Button>
				</PermissionGuard>
			</PageHeading>

			<div className="grid grid-cols-1 items-start gap-8">
				<StudentPaymentList />
			</div>

			<PaymentFormDialog
				open={isAddOpen}
				onOpenChange={setIsAddOpen}
				mode="create"
				onSuccess={() => setIsAddOpen(false)}
			/>
		</div>
	);
}
